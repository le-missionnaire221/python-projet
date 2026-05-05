# Document de Design — Intégration Frontend-Backend

## Vue d'ensemble

Cette fonctionnalité remplace la couche de simulation `localStorage` dans `frontend/src/services/api.ts` par de vrais appels HTTP vers le backend FastAPI. L'objectif est de connecter le frontend React/TypeScript au backend Python sans modifier l'interface publique de `apiService`, afin que les pages existantes (`LoginPage`, `SignupPage`, `DashboardPage`, `ProfilePage`) continuent de fonctionner sans aucune modification.

### Périmètre

- **Fichier principal modifié** : `frontend/src/services/api.ts` — remplacement complet du mock par des appels `fetch`
- **Fichier de configuration** : `frontend/vite.config.ts` — ajout des proxies manquants (`/auth`, `/users`, `/todos`)
- **Types** : `frontend/src/types/index.ts` — déjà alignés avec les schémas Pydantic du backend, aucune modification nécessaire
- **Pages React** : aucune modification — l'interface publique de `apiService` est préservée

### Contraintes techniques

- Utilisation de `fetch` natif (pas d'axios) — disponible nativement dans tous les navigateurs modernes
- Proxy Vite `/api` → `http://localhost:8000` pour éviter les problèmes CORS en développement
- Token JWT stocké dans `localStorage` sous la clé `token`
- `getUser()` reste synchrone (retourne `null` sans appel HTTP si pas de token)

---

## Architecture

### Vue d'ensemble du flux de données

```mermaid
graph TD
    A[Pages React<br/>LoginPage / SignupPage<br/>DashboardPage / ProfilePage] -->|appels identiques| B[apiService<br/>frontend/src/services/api.ts]
    B -->|helper request()| C[fetch natif]
    C -->|/api/auth/token<br/>/api/users/...<br/>/api/todos/...| D[Proxy Vite<br/>vite.config.ts]
    D -->|http://localhost:8000| E[Backend FastAPI<br/>port 8000]
    E -->|JSON| D
    D -->|JSON| C
    C -->|Promise| B
    B -->|User / Todo / AuthResponse| A
    B <-->|lecture/écriture| F[localStorage<br/>clé: token]
```

### Décisions d'architecture

**1. `fetch` natif plutôt qu'axios**
Axios n'est pas une dépendance existante du projet. `fetch` est disponible nativement dans tous les navigateurs modernes et dans Node.js 18+. Cela évite d'ajouter une dépendance externe pour un besoin couvert par la plateforme.

**2. Proxy Vite pour le CORS**
Le backend FastAPI autorise toutes les origines (`allow_origins=["*"]`), mais le proxy Vite reste préférable en développement car il simplifie la gestion des cookies et évite les requêtes preflight OPTIONS. Toutes les requêtes sont préfixées `/api` côté frontend, le proxy supprime ce préfixe avant de transmettre au backend.

**3. Helper `request()` centralisé**
Plutôt que de dupliquer la logique d'en-têtes et de gestion d'erreurs dans chaque méthode, un helper privé `request()` centralise :
- L'ajout de l'en-tête `Authorization: Bearer <token>` sur les endpoints protégés
- L'interception des réponses HTTP avec statut ≥ 400
- L'extraction du champ `detail` du corps JSON d'erreur
- La gestion des erreurs réseau (fetch rejects)

**4. `getUser()` synchrone**
La méthode `getUser()` est utilisée par le routeur React pour vérifier l'état de connexion de manière synchrone (sans `await`). Elle retourne `null` si aucun token n'est présent dans `localStorage`, sans effectuer d'appel HTTP. La récupération du profil complet passe par `getProfile()`.

---

## Composants et interfaces

### Structure du module `api.ts`

```
api.ts
├── BASE_URL                    (constante — VITE_API_BASE_URL ou fallback)
├── getToken()                  (lecture localStorage)
├── request<T>()                (helper HTTP privé centralisé)
└── apiService (export)
    ├── login(formData)
    ├── signup(userData)
    ├── logout()
    ├── getToken()
    ├── getUser()
    ├── getTodos()
    ├── createTodo(todoData)
    ├── updateTodo(id, todoData)
    ├── deleteTodo(id)
    ├── getProfile()
    └── updateProfile(userData)
```

### Interface publique de `apiService` (inchangée)

```typescript
interface ApiService {
  login(formData: FormData): Promise<AuthResponse>;
  signup(userData: Record<string, any>): Promise<User>;
  logout(): void;
  getToken(): string | null;
  getUser(): User | null;
  getTodos(): Promise<Todo[]>;
  createTodo(todoData: Partial<Todo>): Promise<Todo>;
  updateTodo(id: number, todoData: Partial<Todo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
  getProfile(): Promise<User>;
  updateProfile(userData: Partial<User>): Promise<User>;
}
```

### Helper `request<T>()` — signature interne

```typescript
async function request<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T>
```

- `path` : chemin relatif à `BASE_URL` (ex: `/api/todos/`)
- `options.skipAuth` : si `true`, l'en-tête `Authorization` n'est pas ajouté (utilisé pour `/auth/token` et `/users/`)
- Lève une `Error` avec le message approprié pour tout statut ≥ 400 ou erreur réseau

### Mapping des endpoints

| Méthode `apiService`     | Méthode HTTP | Chemin (via proxy)       | Auth requise | Format corps       |
|--------------------------|--------------|--------------------------|--------------|-------------------|
| `login(formData)`        | POST         | `/api/auth/token`        | Non          | `form-urlencoded` |
| `signup(userData)`       | POST         | `/api/users/`            | Non          | JSON              |
| `getTodos()`             | GET          | `/api/todos/`            | Oui          | —                 |
| `createTodo(data)`       | POST         | `/api/todos/`            | Oui          | JSON              |
| `updateTodo(id, data)`   | PUT          | `/api/todos/{id}`        | Oui          | JSON              |
| `deleteTodo(id)`         | DELETE       | `/api/todos/{id}`        | Oui          | —                 |
| `getProfile()`           | GET          | `/api/users/me`          | Oui          | —                 |
| `updateProfile(data)`    | PUT          | `/api/users/me`          | Oui          | JSON              |

### Configuration du proxy Vite

Le fichier `vite.config.ts` doit exposer un seul proxy `/api` qui couvre tous les endpoints :

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

Toutes les requêtes frontend utilisent le préfixe `/api` (ex: `/api/auth/token`, `/api/todos/`, `/api/users/me`). Le proxy supprime ce préfixe avant de transmettre au backend.

---

## Modèles de données

### Types TypeScript (déjà définis dans `types/index.ts`)

```typescript
// Priorité d'une tâche — correspond à PriorityEnum du backend
type Priority = 'low' | 'medium' | 'high';

// Tâche — correspond à TodoResponse Pydantic
type Todo = {
  id: number;
  titre: string;
  description: string;
  priority: Priority;
  owner_id: number;
};

// Utilisateur — correspond à UserResponse Pydantic
type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  tasks?: Todo[];
};

// Réponse d'authentification — correspond au schéma Token Pydantic
type AuthResponse = {
  access_token: string;
  token_type: string;
};
```

### Correspondance avec les schémas Pydantic du backend

| Type TypeScript | Schéma Pydantic    | Champs mappés                                              |
|-----------------|--------------------|------------------------------------------------------------|
| `Todo`          | `TodoResponse`     | `id`, `titre`, `description`, `priority`, `owner_id`      |
| `User`          | `UserResponse`     | `id`, `name`, `email`, `role`, `is_active`, `tasks`        |
| `AuthResponse`  | `Token`            | `access_token`, `token_type`                               |
| `Priority`      | `PriorityEnum`     | `"low"` / `"medium"` / `"high"` — pas de transformation   |

Les valeurs de `PriorityEnum` côté backend (`LOW`, `MEDIUM`, `HIGH`) sont sérialisées en minuscules (`"low"`, `"medium"`, `"high"`) par FastAPI, ce qui correspond directement au type `Priority` TypeScript sans transformation.

### Réponses enveloppées du backend

Les endpoints `POST /todos/` et `PUT /todos/{id}` retournent une réponse enveloppée :

```json
{
  "message": "Tâche ajoutée avec succès",
  "todo": { "id": 1, "titre": "...", "description": "...", "priority": "medium", "owner_id": 1 }
}
```

L'ApiService extrait uniquement l'objet `todo` de cette réponse avant de le retourner.

### Gestion du token

```
localStorage
└── "token"  →  "<valeur du JWT access_token>"  |  null (absent)
```

- **Écriture** : après `login()` réussi — `localStorage.setItem('token', access_token)`
- **Lecture** : dans `getToken()` et dans le helper `request()` pour construire l'en-tête Authorization
- **Suppression** : dans `logout()` et lors d'une réponse 401 sur un endpoint protégé

---

## Propriétés de correction

*Une propriété est une caractéristique ou un comportement qui doit être vrai pour toutes les exécutions valides d'un système — essentiellement, un énoncé formel de ce que le système doit faire. Les propriétés servent de pont entre les spécifications lisibles par l'humain et les garanties de correction vérifiables par machine.*

### Propriété 1 : Préfixage universel des URLs

*Pour toute* méthode de l'ApiService effectuant un appel HTTP, l'URL de la requête émise doit commencer par la valeur de `BASE_URL` configurée.

**Valide : Requirements 1.3**

---

### Propriété 2 : Format de la requête de connexion

*Pour tout* objet `FormData` valide contenant les champs `username` et `password`, la requête émise par `login()` doit être une requête `POST` vers `/api/auth/token` avec le `Content-Type: application/x-www-form-urlencoded` et un corps encodé correctement.

**Valide : Requirements 2.1**

---

### Propriété 3 : Stockage et retour du token après connexion réussie

*Pour tout* `access_token` retourné par le backend avec le statut HTTP 200, après l'appel à `login()` :
- `localStorage.getItem('token')` doit retourner exactement cette valeur
- La promesse doit se résoudre avec un objet `{ access_token, token_type }` conforme au type `AuthResponse`

**Valide : Requirements 2.2, 2.3**

---

### Propriété 4 : Propagation des erreurs HTTP avec message de détail

*Pour tout* code de statut HTTP ≥ 400 et tout corps de réponse JSON contenant un champ `detail`, le helper `request()` doit lever une `Error` dont le message est exactement la valeur du champ `detail`.

**Valide : Requirements 2.5, 3.4, 6.3, 10.3, 11.1, 11.2**

---

### Propriété 5 : Format de la requête d'inscription

*Pour tout* objet `{ name, email, password }` valide, la requête émise par `signup()` doit être une requête `POST` vers `/api/users/` avec le `Content-Type: application/json` et un corps JSON contenant exactement ces champs.

**Valide : Requirements 3.1**

---

### Propriété 6 : Transformation UserResponse → User

*Pour tout* objet `UserResponse` retourné par le backend (par `signup()`, `getProfile()` ou `updateProfile()`), l'objet retourné par l'ApiService doit être conforme au type `User` avec les mêmes valeurs pour tous les champs (`id`, `name`, `email`, `role`, `is_active`, `tasks`).

**Valide : Requirements 3.2, 9.2, 10.2**

---

### Propriété 7 : Round-trip du token dans localStorage

*Pour tout* token stocké dans `localStorage` sous la clé `token`, `apiService.getToken()` doit retourner exactement cette valeur.

**Valide : Requirements 4.2**

---

### Propriété 8 : En-tête Authorization sur les endpoints protégés

*Pour tout* token valide présent dans `localStorage` et toute méthode protégée de l'ApiService (`getTodos`, `createTodo`, `updateTodo`, `deleteTodo`, `getProfile`, `updateProfile`), la requête HTTP émise doit contenir l'en-tête `Authorization: Bearer <token>` avec exactement la valeur du token stocké.

**Valide : Requirements 4.3**

---

### Propriété 9 : Transformation TodoResponse[] → Todo[]

*Pour tout* tableau de `TodoResponse` retourné par le backend via `getTodos()`, le tableau retourné par l'ApiService doit être conforme au type `Todo[]` avec les mêmes valeurs pour tous les champs de chaque élément.

**Valide : Requirements 5.2**

---

### Propriété 10 : Extraction de l'objet todo depuis la réponse enveloppée

*Pour tout* objet `{ message, todo }` retourné par le backend via `createTodo()` ou `updateTodo()`, l'ApiService doit retourner uniquement l'objet `todo` conforme au type `Todo`, sans le champ `message`.

**Valide : Requirements 6.2, 7.2**

---

### Propriété 11 : Construction de l'URL pour les opérations sur un todo spécifique

*Pour tout* identifiant `id` valide passé à `updateTodo(id, data)` ou `deleteTodo(id)`, l'URL de la requête HTTP émise doit se terminer par `/todos/{id}` avec la valeur exacte de `id`.

**Valide : Requirements 7.1, 8.1**

---

### Propriété 12 : Sérialisation partielle du profil

*Pour tout* objet partiel `userData` passé à `updateProfile()` (contenant un sous-ensemble quelconque de `{ name, email, password }`), le corps JSON de la requête `PUT /api/users/me` doit contenir exactement les champs fournis — ni plus (pas de champs `undefined`), ni moins.

**Valide : Requirements 10.1**

---

## Gestion des erreurs

### Stratégie centralisée dans `request()`

Le helper `request()` est le point unique de gestion des erreurs HTTP. Il suit cette logique :

```
fetch(url, options)
  ├── Erreur réseau (fetch rejects)
  │   └── throw new Error("Erreur réseau : impossible de contacter le serveur")
  └── Réponse reçue
      ├── statut < 400 → retourner response.json()
      └── statut ≥ 400
          ├── Tenter de parser le corps JSON
          │   ├── corps.detail présent → throw new Error(corps.detail)
          │   └── corps.detail absent → throw new Error(response.statusText)
          └── Corps non parseable → throw new Error(response.statusText)
```

### Gestion spécifique par méthode

Certaines méthodes appliquent une transformation du message d'erreur avant de propager :

| Méthode          | Statut | Message backend                  | Message retourné                    |
|------------------|--------|----------------------------------|-------------------------------------|
| `login()`        | 401    | `"Incorrect email or password"`  | `"Email ou mot de passe incorrect"` |
| `signup()`       | 400    | `"Email déjà enregistré"`        | `"Cet email est déjà utilisé"`      |
| `getTodos()`     | 401    | tout                             | `"Non authentifié"` + suppression token |
| `getProfile()`   | 401    | tout                             | `"Non authentifié"` + suppression token |
| `updateTodo()`   | 404    | tout                             | `"Tâche non trouvée"`               |
| `deleteTodo()`   | 404    | tout                             | `"Tâche non trouvée"`               |

### Gestion du token expiré (401 sur endpoints protégés)

Lorsqu'un endpoint protégé retourne 401, l'ApiService :
1. Supprime le token de `localStorage` (déconnexion automatique)
2. Lève une erreur `"Non authentifié"`

Cela permet au routeur React de rediriger vers la page de connexion.

---

## Stratégie de tests

### Approche duale

Les tests combinent deux niveaux complémentaires :
- **Tests unitaires** : vérifient des comportements spécifiques, des cas limites et des conditions d'erreur avec des exemples concrets
- **Tests de propriétés** : vérifient des propriétés universelles sur un large espace d'entrées via la génération aléatoire

### Bibliothèque de tests de propriétés

Pour TypeScript/Vitest, utiliser **[fast-check](https://github.com/dubzzz/fast-check)** (version exacte à épingler dans `package.json`). Fast-check est la bibliothèque de property-based testing de référence pour l'écosystème JavaScript/TypeScript.

Chaque test de propriété doit être configuré avec un minimum de **100 itérations** (`numRuns: 100`).

### Tests unitaires (exemples et cas limites)

```
api.test.ts
├── login()
│   ├── retourne AuthResponse sur 200
│   ├── lève "Email ou mot de passe incorrect" sur 401
│   └── lève le message detail sur autres erreurs
├── signup()
│   ├── retourne User sur 200
│   └── lève "Cet email est déjà utilisé" sur 400 avec detail "Email déjà enregistré"
├── logout()
│   └── supprime la clé "token" de localStorage
├── getUser()
│   ├── retourne null si pas de token (sans appel fetch)
│   └── retourne null si token présent (comportement synchrone)
├── getTodos() / getProfile()
│   └── supprime le token et lève "Non authentifié" sur 401
├── updateTodo() / deleteTodo()
│   └── lève "Tâche non trouvée" sur 404
└── request() helper
    ├── lève "Erreur réseau : impossible de contacter le serveur" sur erreur réseau
    └── utilise statusText si pas de champ detail dans le corps d'erreur
```

### Tests de propriétés

Chaque propriété du document de design correspond à un test de propriété unique.

**Configuration commune :**
```typescript
// Tag format : Feature: frontend-backend-integration, Property N: <texte>
fc.assert(fc.asyncProperty(...), { numRuns: 100 });
```

| Test de propriété | Propriété du design | Générateurs fast-check |
|-------------------|---------------------|------------------------|
| Préfixage URLs | Propriété 1 | `fc.constantFrom(...méthodes)` |
| Format login | Propriété 2 | `fc.record({ username: fc.emailAddress(), password: fc.string() })` |
| Stockage token | Propriété 3 | `fc.string({ minLength: 10 })` (token JWT simulé) |
| Propagation erreurs | Propriété 4 | `fc.integer({ min: 400, max: 599 })`, `fc.string()` (detail) |
| Format signup | Propriété 5 | `fc.record({ name: fc.string(), email: fc.emailAddress(), password: fc.string() })` |
| Transformation User | Propriété 6 | `fc.record(...)` (UserResponse complet) |
| Round-trip token | Propriété 7 | `fc.string({ minLength: 1 })` |
| En-tête Authorization | Propriété 8 | `fc.string({ minLength: 10 })` (token), `fc.constantFrom(...méthodes protégées)` |
| Transformation Todo[] | Propriété 9 | `fc.array(fc.record(...))` (TodoResponse[]) |
| Extraction todo enveloppé | Propriété 10 | `fc.record(...)` ({message, todo}) |
| URL avec id | Propriété 11 | `fc.integer({ min: 1 })` |
| Sérialisation partielle | Propriété 12 | `fc.record({ name: fc.option(fc.string()), email: fc.option(fc.emailAddress()), password: fc.option(fc.string()) })` |

### Tests d'intégration (optionnels)

Des tests d'intégration end-to-end peuvent être ajoutés pour vérifier le flux complet frontend → proxy Vite → backend FastAPI avec une base de données de test. Ces tests ne font pas partie du périmètre de cette fonctionnalité.

### Vérification statique

La conformité des types TypeScript avec les schémas Pydantic du backend est vérifiée à la compilation :
```bash
npx tsc --noEmit
```

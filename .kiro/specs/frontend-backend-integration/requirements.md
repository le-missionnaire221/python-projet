# Document de Requirements

## Introduction

Cette fonctionnalité consiste à remplacer la couche de simulation localStorage dans `frontend/src/services/api.ts` par de vrais appels HTTP vers le backend FastAPI existant. Le frontend React/TypeScript communiquera avec les endpoints REST du backend pour l'authentification, la gestion des tâches (todos) et la gestion du profil utilisateur. L'interface publique de `apiService` doit rester identique afin de ne pas modifier les pages existantes (`LoginPage`, `SignupPage`, `DashboardPage`, `ProfilePage`).

## Glossaire

- **ApiService** : Le module singleton `frontend/src/services/api.ts` exposant toutes les méthodes d'accès aux données utilisées par les pages React.
- **Backend** : L'application FastAPI Python exposant les endpoints REST sur `http://localhost:8000`.
- **Token** : Le jeton d'accès JWT de type Bearer retourné par le backend lors d'une authentification réussie.
- **Todo** : Une tâche appartenant à un utilisateur, avec les champs `id`, `titre`, `description`, `priority` et `owner_id`.
- **User** : Un utilisateur avec les champs `id`, `name`, `email`, `role`, `is_active` et `tasks`.
- **AuthResponse** : La réponse d'authentification contenant `access_token` et `token_type`.
- **HttpClient** : Le mécanisme HTTP interne à l'ApiService (basé sur `fetch` ou `axios`) chargé d'envoyer les requêtes et de gérer les en-têtes d'autorisation.
- **TokenStorage** : Le mécanisme de persistance du Token dans le `localStorage` du navigateur.
- **PriorityEnum** : L'énumération des niveaux de priorité d'un Todo : `"low"`, `"medium"`, `"high"`.

---

## Requirements

### Requirement 1 : Configuration de l'URL de base

**User Story :** En tant que développeur, je veux configurer l'URL de base du backend en un seul endroit, afin de pouvoir changer d'environnement (développement, production) sans modifier chaque appel HTTP.

#### Critères d'acceptation

1. THE ApiService SHALL lire l'URL de base du backend depuis la variable d'environnement `VITE_API_BASE_URL`.
2. IF la variable d'environnement `VITE_API_BASE_URL` est absente, THEN THE ApiService SHALL utiliser `http://localhost:8000` comme valeur par défaut.
3. THE ApiService SHALL préfixer chaque requête HTTP sortante avec l'URL de base configurée.

---

### Requirement 2 : Authentification — Connexion

**User Story :** En tant qu'utilisateur, je veux me connecter avec mon email et mon mot de passe, afin d'obtenir un token d'accès pour utiliser l'application.

#### Critères d'acceptation

1. WHEN `apiService.login(formData)` est appelé avec un objet `FormData` contenant les champs `username` et `password`, THE ApiService SHALL envoyer une requête `POST /auth/token` au Backend avec le corps encodé en `application/x-www-form-urlencoded`.
2. WHEN le Backend retourne un objet `{access_token, token_type}` avec le statut HTTP 200, THE ApiService SHALL stocker la valeur de `access_token` dans le TokenStorage sous la clé `token`.
3. WHEN le Backend retourne un objet `{access_token, token_type}` avec le statut HTTP 200, THE ApiService SHALL retourner un objet conforme au type `AuthResponse`.
4. IF le Backend retourne le statut HTTP 401, THEN THE ApiService SHALL lever une erreur avec le message `"Email ou mot de passe incorrect"`.
5. IF le Backend retourne un statut HTTP d'erreur autre que 401, THEN THE ApiService SHALL lever une erreur avec le message de détail fourni par le Backend.

---

### Requirement 3 : Authentification — Inscription

**User Story :** En tant que nouvel utilisateur, je veux créer un compte avec mon nom, mon email et mon mot de passe, afin d'accéder à l'application.

#### Critères d'acceptation

1. WHEN `apiService.signup({name, email, password})` est appelé, THE ApiService SHALL envoyer une requête `POST /users/` au Backend avec un corps JSON contenant les champs `name`, `email` et `password`.
2. WHEN le Backend retourne un objet `UserResponse` avec le statut HTTP 200, THE ApiService SHALL retourner un objet conforme au type `User`.
3. IF le Backend retourne le statut HTTP 400 avec le détail `"Email déjà enregistré"`, THEN THE ApiService SHALL lever une erreur avec le message `"Cet email est déjà utilisé"`.
4. IF le Backend retourne un statut HTTP d'erreur, THEN THE ApiService SHALL lever une erreur avec le message de détail fourni par le Backend.

---

### Requirement 4 : Authentification — Déconnexion et lecture du token

**User Story :** En tant qu'utilisateur connecté, je veux pouvoir me déconnecter et que l'application vérifie mon état de connexion, afin de sécuriser l'accès aux pages protégées.

#### Critères d'acceptation

1. WHEN `apiService.logout()` est appelé, THE ApiService SHALL supprimer la clé `token` du TokenStorage.
2. WHEN `apiService.getToken()` est appelé, THE ApiService SHALL retourner la valeur stockée sous la clé `token` dans le TokenStorage, ou `null` si elle est absente.
3. WHILE un Token est présent dans le TokenStorage, THE ApiService SHALL inclure l'en-tête `Authorization: Bearer <token>` dans toutes les requêtes HTTP vers les endpoints protégés.

---

### Requirement 5 : Gestion des todos — Lecture

**User Story :** En tant qu'utilisateur connecté, je veux récupérer la liste de mes tâches depuis le backend, afin de les afficher dans le tableau de bord.

#### Critères d'acceptation

1. WHEN `apiService.getTodos()` est appelé, THE ApiService SHALL envoyer une requête `GET /todos/` au Backend avec l'en-tête `Authorization: Bearer <token>`.
2. WHEN le Backend retourne un tableau d'objets `TodoResponse` avec le statut HTTP 200, THE ApiService SHALL retourner un tableau d'objets conformes au type `Todo`.
3. IF le Backend retourne le statut HTTP 401, THEN THE ApiService SHALL lever une erreur avec le message `"Non authentifié"` et supprimer le Token du TokenStorage.

---

### Requirement 6 : Gestion des todos — Création

**User Story :** En tant qu'utilisateur connecté, je veux créer une nouvelle tâche, afin de l'ajouter à ma liste.

#### Critères d'acceptation

1. WHEN `apiService.createTodo({titre, description, priority})` est appelé, THE ApiService SHALL envoyer une requête `POST /todos/` au Backend avec un corps JSON contenant les champs `titre`, `description` et `priority`, et l'en-tête `Authorization: Bearer <token>`.
2. WHEN le Backend retourne un objet contenant la clé `todo` avec le statut HTTP 200, THE ApiService SHALL extraire l'objet `todo` et le retourner comme objet conforme au type `Todo`.
3. IF le Backend retourne un statut HTTP d'erreur, THEN THE ApiService SHALL lever une erreur avec le message de détail fourni par le Backend.

---

### Requirement 7 : Gestion des todos — Modification

**User Story :** En tant qu'utilisateur connecté, je veux modifier une tâche existante, afin de mettre à jour son titre, sa description ou sa priorité.

#### Critères d'acceptation

1. WHEN `apiService.updateTodo(id, {titre, description, priority})` est appelé, THE ApiService SHALL envoyer une requête `PUT /todos/{id}` au Backend avec un corps JSON contenant les champs `titre`, `description` et `priority`, et l'en-tête `Authorization: Bearer <token>`.
2. WHEN le Backend retourne un objet contenant la clé `todo` avec le statut HTTP 200, THE ApiService SHALL extraire l'objet `todo` et le retourner comme objet conforme au type `Todo`.
3. IF le Backend retourne le statut HTTP 404, THEN THE ApiService SHALL lever une erreur avec le message `"Tâche non trouvée"`.

---

### Requirement 8 : Gestion des todos — Suppression

**User Story :** En tant qu'utilisateur connecté, je veux supprimer une tâche, afin de la retirer définitivement de ma liste.

#### Critères d'acceptation

1. WHEN `apiService.deleteTodo(id)` est appelé, THE ApiService SHALL envoyer une requête `DELETE /todos/{id}` au Backend avec l'en-tête `Authorization: Bearer <token>`.
2. WHEN le Backend retourne le statut HTTP 200, THE ApiService SHALL résoudre la promesse sans valeur de retour (`void`).
3. IF le Backend retourne le statut HTTP 404, THEN THE ApiService SHALL lever une erreur avec le message `"Tâche non trouvée"`.

---

### Requirement 9 : Gestion du profil — Lecture

**User Story :** En tant qu'utilisateur connecté, je veux récupérer mon profil depuis le backend, afin d'afficher mes informations personnelles et mes statistiques.

#### Critères d'acceptation

1. WHEN `apiService.getProfile()` est appelé, THE ApiService SHALL envoyer une requête `GET /users/me` au Backend avec l'en-tête `Authorization: Bearer <token>`.
2. WHEN le Backend retourne un objet `UserResponse` avec le statut HTTP 200, THE ApiService SHALL retourner un objet conforme au type `User` incluant le tableau `tasks`.
3. IF le Backend retourne le statut HTTP 401, THEN THE ApiService SHALL lever une erreur avec le message `"Non authentifié"` et supprimer le Token du TokenStorage.

---

### Requirement 10 : Gestion du profil — Mise à jour

**User Story :** En tant qu'utilisateur connecté, je veux mettre à jour mon nom, mon email ou mon mot de passe, afin de maintenir mes informations à jour.

#### Critères d'acceptation

1. WHEN `apiService.updateProfile({name, email, password})` est appelé, THE ApiService SHALL envoyer une requête `PUT /users/me` au Backend avec un corps JSON contenant uniquement les champs fournis (champs optionnels), et l'en-tête `Authorization: Bearer <token>`.
2. WHEN le Backend retourne un objet `UserResponse` avec le statut HTTP 200, THE ApiService SHALL retourner un objet conforme au type `User`.
3. IF le Backend retourne le statut HTTP 400, THEN THE ApiService SHALL lever une erreur avec le message de détail fourni par le Backend.

---

### Requirement 11 : Gestion centralisée des erreurs HTTP

**User Story :** En tant que développeur, je veux que toutes les erreurs HTTP soient gérées de manière uniforme, afin d'éviter la duplication de code de gestion d'erreurs dans chaque méthode.

#### Critères d'acceptation

1. THE HttpClient SHALL intercepter toutes les réponses HTTP dont le statut est supérieur ou égal à 400.
2. WHEN une réponse HTTP d'erreur est interceptée, THE HttpClient SHALL extraire le champ `detail` du corps JSON de la réponse et le propager comme message d'erreur.
3. IF le corps de la réponse d'erreur ne contient pas de champ `detail`, THEN THE HttpClient SHALL utiliser le texte de statut HTTP comme message d'erreur.
4. WHEN une erreur réseau survient (absence de connexion, timeout), THE HttpClient SHALL lever une erreur avec le message `"Erreur réseau : impossible de contacter le serveur"`.

---

### Requirement 12 : Alignement des types TypeScript avec les schémas backend

**User Story :** En tant que développeur, je veux que les types TypeScript du frontend correspondent exactement aux schémas Pydantic du backend, afin d'éviter les erreurs de typage à la compilation.

#### Critères d'acceptation

1. THE ApiService SHALL utiliser le type `Todo` avec les champs `id: number`, `titre: string`, `description: string`, `priority: "low" | "medium" | "high"` et `owner_id: number`.
2. THE ApiService SHALL utiliser le type `User` avec les champs `id: number`, `name: string`, `email: string`, `role: "user" | "admin"`, `is_active: boolean` et `tasks: Todo[]`.
3. THE ApiService SHALL utiliser le type `AuthResponse` avec les champs `access_token: string` et `token_type: string`.
4. WHEN le Backend retourne un champ `priority` avec la valeur `"medium"`, THE ApiService SHALL le mapper vers la valeur TypeScript `"medium"` du type `PriorityEnum` sans transformation.

---

### Requirement 13 : Compatibilité de l'interface publique de l'ApiService

**User Story :** En tant que développeur, je veux que l'interface publique de `apiService` reste identique après le remplacement du mock, afin de ne modifier aucune des pages existantes.

#### Critères d'acceptation

1. THE ApiService SHALL exposer exactement les méthodes suivantes avec leurs signatures inchangées : `login(formData: FormData)`, `signup(userData: Record<string, any>)`, `logout()`, `getToken()`, `getUser()`, `getTodos()`, `createTodo(todoData: Partial<Todo>)`, `updateTodo(id: number, todoData: Partial<Todo>)`, `deleteTodo(id: number)`, `getProfile()`, `updateProfile(userData: Partial<User>)`.
2. THE ApiService SHALL retourner des promesses (`Promise`) pour toutes les méthodes asynchrones, conformément à l'interface actuelle.
3. WHEN `apiService.getUser()` est appelé, THE ApiService SHALL retourner `null` si aucun Token n'est présent dans le TokenStorage, sans effectuer d'appel HTTP.

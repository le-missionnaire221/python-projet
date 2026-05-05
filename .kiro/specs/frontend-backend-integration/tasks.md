# Plan d'implémentation : Intégration Frontend-Backend

## Vue d'ensemble

Remplacement de la couche de simulation `localStorage` dans `frontend/src/services/api.ts` par de vrais appels HTTP `fetch` vers le backend FastAPI, et simplification du proxy Vite en un seul préfixe `/api`. L'interface publique de `apiService` est préservée — aucune page React n'est modifiée.

## Tâches

- [x] 1. Simplifier la configuration du proxy Vite
  - Modifier `frontend/vite.config.ts` pour ne conserver qu'un seul proxy `/api` couvrant tous les endpoints
  - Supprimer l'entrée `/token` redondante
  - Vérifier que la règle `rewrite` supprime bien le préfixe `/api` avant transmission au backend
  - _Requirements : 1.1, 1.2, 1.3_

- [x] 2. Implémenter le helper `request()` centralisé
  - [x] 2.1 Écrire le helper `request<T>()` dans `frontend/src/services/api.ts`
    - Définir la constante `BASE_URL` lisant `import.meta.env.VITE_API_BASE_URL` avec fallback `http://localhost:8000`
    - Écrire la fonction `getToken()` privée lisant `localStorage.getItem('token')`
    - Implémenter `request<T>(path, options?)` avec :
      - Ajout automatique de l'en-tête `Authorization: Bearer <token>` sauf si `skipAuth: true`
      - Interception des statuts ≥ 400 : extraction du champ `detail` du corps JSON, fallback sur `statusText`
      - Gestion des erreurs réseau (`fetch` rejects) avec le message `"Erreur réseau : impossible de contacter le serveur"`
    - Supprimer tout le code mock (helpers `storage`, données par défaut, `delay`)
    - _Requirements : 1.1, 1.2, 1.3, 4.3, 11.1, 11.2, 11.3, 11.4_

  - [ ]* 2.2 Écrire le test de propriété — Propriété 1 : Préfixage universel des URLs
    - **Propriété 1 : Préfixage universel des URLs**
    - **Valide : Requirements 1.3**
    - Utiliser `fc.constantFrom(...méthodes)` pour vérifier que chaque méthode préfixe bien l'URL avec `BASE_URL`

  - [ ]* 2.3 Écrire le test de propriété — Propriété 4 : Propagation des erreurs HTTP avec message de détail
    - **Propriété 4 : Propagation des erreurs HTTP avec message de détail**
    - **Valide : Requirements 11.1, 11.2**
    - Utiliser `fc.integer({ min: 400, max: 599 })` et `fc.string()` pour le champ `detail`
    - Vérifier que `request()` lève une `Error` dont le message est exactement la valeur de `detail`

  - [ ]* 2.4 Écrire les tests unitaires du helper `request()`
    - Tester la levée de `"Erreur réseau : impossible de contacter le serveur"` sur erreur réseau
    - Tester le fallback sur `statusText` quand le corps d'erreur ne contient pas de champ `detail`
    - _Requirements : 11.3, 11.4_

- [x] 3. Implémenter les méthodes d'authentification
  - [x] 3.1 Implémenter `login(formData)`
    - Appeler `POST /api/auth/token` via `request()` avec `skipAuth: true` et le `FormData` encodé en `application/x-www-form-urlencoded`
    - Stocker `access_token` dans `localStorage` sous la clé `token` après succès
    - Intercepter les erreurs 401 pour retourner `"Email ou mot de passe incorrect"`
    - _Requirements : 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Écrire le test de propriété — Propriété 2 : Format de la requête de connexion
    - **Propriété 2 : Format de la requête de connexion**
    - **Valide : Requirements 2.1**
    - Utiliser `fc.record({ username: fc.emailAddress(), password: fc.string() })`
    - Vérifier que la requête est `POST`, vers `/api/auth/token`, avec `Content-Type: application/x-www-form-urlencoded`

  - [ ]* 3.3 Écrire le test de propriété — Propriété 3 : Stockage et retour du token après connexion réussie
    - **Propriété 3 : Stockage et retour du token après connexion réussie**
    - **Valide : Requirements 2.2, 2.3**
    - Utiliser `fc.string({ minLength: 10 })` pour simuler un JWT
    - Vérifier que `localStorage.getItem('token')` retourne exactement la valeur reçue et que la promesse se résout avec un `AuthResponse` conforme

  - [x] 3.4 Implémenter `signup(userData)`
    - Appeler `POST /api/users/` via `request()` avec `skipAuth: true` et un corps JSON `{ name, email, password }`
    - Intercepter les erreurs 400 avec `detail === "Email déjà enregistré"` pour retourner `"Cet email est déjà utilisé"`
    - _Requirements : 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.5 Écrire le test de propriété — Propriété 5 : Format de la requête d'inscription
    - **Propriété 5 : Format de la requête d'inscription**
    - **Valide : Requirements 3.1**
    - Utiliser `fc.record({ name: fc.string(), email: fc.emailAddress(), password: fc.string() })`
    - Vérifier que la requête est `POST`, vers `/api/users/`, avec `Content-Type: application/json` et un corps JSON contenant exactement ces champs

  - [ ]* 3.6 Écrire le test de propriété — Propriété 6 : Transformation UserResponse → User (signup)
    - **Propriété 6 : Transformation UserResponse → User**
    - **Valide : Requirements 3.2**
    - Utiliser `fc.record({ id: fc.integer({ min: 1 }), name: fc.string(), email: fc.emailAddress(), role: fc.constantFrom('user', 'admin'), is_active: fc.boolean(), tasks: fc.array(fc.record({ id: fc.integer({ min: 1 }), titre: fc.string(), description: fc.string(), priority: fc.constantFrom('low', 'medium', 'high'), owner_id: fc.integer({ min: 1 }) })) })`
    - Vérifier que l'objet retourné est conforme au type `User` avec les mêmes valeurs

  - [x] 3.7 Implémenter `logout()`, `getToken()` et `getUser()`
    - `logout()` : supprimer la clé `token` de `localStorage`
    - `getToken()` : retourner `localStorage.getItem('token')`
    - `getUser()` : retourner `null` si pas de token (sans appel HTTP)
    - _Requirements : 4.1, 4.2, 13.3_

  - [ ]* 3.8 Écrire le test de propriété — Propriété 7 : Round-trip du token dans localStorage
    - **Propriété 7 : Round-trip du token dans localStorage**
    - **Valide : Requirements 4.2**
    - Utiliser `fc.string({ minLength: 1 })`
    - Vérifier que `apiService.getToken()` retourne exactement la valeur stockée via `localStorage.setItem('token', ...)`

- [ ] 4. Point de contrôle — Vérifier les tests d'authentification
  - S'assurer que tous les tests des méthodes d'authentification passent, demander à l'utilisateur si des questions se posent.

- [ ] 5. Implémenter les méthodes de gestion des todos
  - [x] 5.1 Implémenter `getTodos()`
    - Appeler `GET /api/todos/` via `request()` avec authentification
    - Intercepter les erreurs 401 : supprimer le token et lever `"Non authentifié"`
    - _Requirements : 5.1, 5.2, 5.3_

  - [ ]* 5.2 Écrire le test de propriété — Propriété 8 : En-tête Authorization sur les endpoints protégés (getTodos)
    - **Propriété 8 : En-tête Authorization sur les endpoints protégés**
    - **Valide : Requirements 4.3**
    - Utiliser `fc.string({ minLength: 10 })` pour le token et `fc.constantFrom('getTodos', 'getProfile', 'updateProfile')` pour les méthodes
    - Vérifier que la requête contient `Authorization: Bearer <token>` avec exactement la valeur stockée

  - [ ]* 5.3 Écrire le test de propriété — Propriété 9 : Transformation TodoResponse[] → Todo[]
    - **Propriété 9 : Transformation TodoResponse[] → Todo[]**
    - **Valide : Requirements 5.2**
    - Utiliser `fc.array(fc.record({ id: fc.integer({ min: 1 }), titre: fc.string(), description: fc.string(), priority: fc.constantFrom('low', 'medium', 'high'), owner_id: fc.integer({ min: 1 }) }))`
    - Vérifier que le tableau retourné est conforme au type `Todo[]` avec les mêmes valeurs

  - [x] 5.4 Implémenter `createTodo(todoData)`
    - Appeler `POST /api/todos/` via `request()` avec authentification et un corps JSON `{ titre, description, priority }`
    - Extraire l'objet `todo` de la réponse enveloppée `{ message, todo }`
    - _Requirements : 6.1, 6.2, 6.3_

  - [ ]* 5.5 Écrire le test de propriété — Propriété 10 : Extraction de l'objet todo depuis la réponse enveloppée
    - **Propriété 10 : Extraction de l'objet todo depuis la réponse enveloppée**
    - **Valide : Requirements 6.2, 7.2**
    - Utiliser `fc.record({ message: fc.string(), todo: fc.record({ id: fc.integer({ min: 1 }), titre: fc.string(), description: fc.string(), priority: fc.constantFrom('low', 'medium', 'high'), owner_id: fc.integer({ min: 1 }) }) })`
    - Vérifier que `createTodo()` et `updateTodo()` retournent uniquement l'objet `todo` sans le champ `message`

  - [x] 5.6 Implémenter `updateTodo(id, todoData)`
    - Appeler `PUT /api/todos/{id}` via `request()` avec authentification et un corps JSON
    - Extraire l'objet `todo` de la réponse enveloppée
    - Intercepter les erreurs 404 pour lever `"Tâche non trouvée"`
    - _Requirements : 7.1, 7.2, 7.3_

  - [ ]* 5.7 Écrire le test de propriété — Propriété 11 : Construction de l'URL pour les opérations sur un todo spécifique
    - **Propriété 11 : Construction de l'URL pour les opérations sur un todo spécifique**
    - **Valide : Requirements 7.1, 8.1**
    - Utiliser `fc.integer({ min: 1 })` pour l'identifiant
    - Vérifier que l'URL de la requête se termine par `/todos/{id}` avec la valeur exacte de `id`

  - [x] 5.8 Implémenter `deleteTodo(id)`
    - Appeler `DELETE /api/todos/{id}` via `request()` avec authentification
    - Intercepter les erreurs 404 pour lever `"Tâche non trouvée"`
    - Résoudre la promesse sans valeur de retour sur succès
    - _Requirements : 8.1, 8.2, 8.3_

- [ ] 6. Point de contrôle — Vérifier les tests des todos
  - S'assurer que tous les tests des méthodes todos passent, demander à l'utilisateur si des questions se posent.

- [ ] 7. Implémenter les méthodes de gestion du profil
  - [x] 7.1 Implémenter `getProfile()`
    - Appeler `GET /api/users/me` via `request()` avec authentification
    - Intercepter les erreurs 401 : supprimer le token et lever `"Non authentifié"`
    - _Requirements : 9.1, 9.2, 9.3_

  - [x] 7.2 Implémenter `updateProfile(userData)`
    - Appeler `PUT /api/users/me` via `request()` avec authentification et un corps JSON contenant uniquement les champs fournis (pas de champs `undefined`)
    - _Requirements : 10.1, 10.2, 10.3_

  - [ ]* 7.3 Écrire le test de propriété — Propriété 12 : Sérialisation partielle du profil
    - **Propriété 12 : Sérialisation partielle du profil**
    - **Valide : Requirements 10.1**
    - Utiliser `fc.record({ name: fc.option(fc.string()), email: fc.option(fc.emailAddress()), password: fc.option(fc.string()) }, { requiredKeys: [] })`
    - Vérifier que le corps JSON contient exactement les champs fournis — ni plus (pas de champs `undefined`), ni moins

  - [ ]* 7.4 Écrire le test de propriété — Propriété 6 : Transformation UserResponse → User (getProfile / updateProfile)
    - **Propriété 6 : Transformation UserResponse → User (getProfile / updateProfile)**
    - **Valide : Requirements 9.2, 10.2**
    - Réutiliser le générateur `UserResponse` complet avec le tableau `tasks`
    - Vérifier que `getProfile()` et `updateProfile()` retournent un objet conforme au type `User` incluant `tasks`

  - [ ]* 7.5 Écrire les tests unitaires des méthodes de profil
    - Tester la suppression du token et la levée de `"Non authentifié"` sur 401 pour `getProfile()`
    - Tester la levée du message `detail` sur 400 pour `updateProfile()`
    - _Requirements : 9.3, 10.3_

- [ ] 8. Installer fast-check et configurer le fichier de tests
  - Ajouter `fast-check` en dépendance de développement dans `frontend/package.json` (version épinglée)
  - Créer le fichier `frontend/src/services/api.test.ts` avec la configuration Vitest et fast-check
  - Configurer chaque `fc.assert` avec `{ numRuns: 100 }`
  - _Requirements : 12.1, 12.2, 12.3, 12.4, 13.1, 13.2_

- [ ] 9. Point de contrôle final — Vérifier l'ensemble des tests et la compilation TypeScript
  - Exécuter `npx tsc --noEmit` dans `frontend/` pour vérifier l'absence d'erreurs de typage
  - S'assurer que tous les tests passent (`vitest --run`), demander à l'utilisateur si des questions se posent.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP plus rapide
- Chaque tâche référence les requirements spécifiques pour la traçabilité
- Les tests de propriétés valident des comportements universels sur un large espace d'entrées (100 itérations minimum)
- Les tests unitaires valident des exemples concrets et des cas limites
- `fast-check` est la bibliothèque de property-based testing de référence pour TypeScript/Vitest

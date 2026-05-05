# Plan d'implémentation : `task-status-and-admin`

## Vue d'ensemble

Implémentation en deux phases : backend d'abord (migration BD, modèle, schémas, CRUD, endpoints), puis frontend (types TypeScript, service API, composants, pages). Chaque étape s'appuie sur la précédente pour garantir une intégration progressive et sans code orphelin.

## Tâches

- [x] 1. Migration de la base de données — ajout de la colonne `status`
  - Créer un script de migration SQL dans `app/` (ex. `migrate_add_status.py` ou fichier `.sql`) exécutant :
    ```sql
    CREATE TYPE status_enum AS ENUM ('en_cours', 'a_tester', 'approuve');
    ALTER TABLE taches ADD COLUMN status status_enum NOT NULL DEFAULT 'en_cours';
    ```
  - Vérifier que les tâches existantes reçoivent bien la valeur `en_cours` après migration.
  - _Requirements : 1.2, 1.3_

- [ ] 2. Modèle SQLAlchemy — `StatusEnum` et colonne `status`
  - [x] 2.1 Ajouter `StatusEnum` et la colonne `status` dans `app/models/todo.py`
    - Définir `StatusEnum(str, PyEnum)` avec les valeurs `EN_COURS`, `A_TESTER`, `APPROUVE`.
    - Ajouter la colonne `status = Column(Enum(StatusEnum, name="status_enum"), default=StatusEnum.EN_COURS, nullable=False)` sur la classe `Tache`.
    - _Requirements : 1.1, 1.2_

  - [ ]* 2.2 Écrire les tests unitaires du modèle `StatusEnum`
    - Vérifier que `StatusEnum` contient exactement 3 valeurs (`en_cours`, `a_tester`, `approuve`).
    - Vérifier que la valeur par défaut de la colonne `status` est `StatusEnum.EN_COURS`.
    - _Requirements : 1.1_

- [ ] 3. Schémas Pydantic — mise à jour de `TodoCreate`, `TodoResponse` et `UserCreate`
  - [ ] 3.1 Mettre à jour `app/schemas/todo.py`
    - Importer `StatusEnum` depuis `app/models/todo`.
    - Ajouter `status: StatusEnum = StatusEnum.EN_COURS` dans `TodoBase`.
    - Ajouter `owner_id: Optional[int] = None` dans `TodoCreate`.
    - Vérifier que `TodoResponse` inclut le champ `status`.
    - _Requirements : 1.4, 1.5, 3.1_

  - [ ] 3.2 Mettre à jour `app/schemas/user.py`
    - Importer `RoleEnum` depuis `app/models/user`.
    - Ajouter `role: Optional[RoleEnum] = RoleEnum.USER` dans `UserCreate`.
    - _Requirements : 4.5_

  - [ ]* 3.3 Écrire les tests unitaires des schémas
    - Vérifier que `TodoCreate()` sans arguments a `status=StatusEnum.EN_COURS` et `owner_id=None`.
    - Vérifier qu'une valeur de `status` invalide lève une `ValidationError` Pydantic (HTTP 422).
    - Vérifier que `UserCreate` accepte un champ `role` optionnel avec défaut `user`.
    - _Requirements : 1.4, 2.2, 4.5_

- [ ] 4. CRUD — mise à jour de `create_todo` et `update_todo`
  - [ ] 4.1 Mettre à jour `app/crud/crud_todo.py`
    - Dans `create_todo(db, todo, user_id)` : utiliser `todo.owner_id` comme `owner_id` effectif s'il est fourni, sinon `user_id`.
    - Dans `update_todo(db, db_todo, todo_in)` : persister `todo_in.status` en plus des champs existants.
    - _Requirements : 2.4, 3.2, 3.3_

  - [ ]* 4.2 Écrire le test de propriété P4 — Résolution du `owner_id` lors de la création
    - **Propriété 4 : Résolution du propriétaire lors de la création d'une tâche (admin)**
    - `@given(st.booleans())` — avec ou sans `owner_id` fourni.
    - Vérifier que le `owner_id` persisté est celui fourni (si présent) ou l'id de l'admin (sinon).
    - **Valide : Requirements 3.2, 3.3**

  - [ ]* 4.3 Écrire le test de propriété P2 — Mise à jour du statut persistée
    - **Propriété 2 : Mise à jour du statut persistée**
    - `@given(st.sampled_from(StatusEnum), st.sampled_from(StatusEnum))` — status initial et status cible.
    - Vérifier que le status lu après `PUT /todos/{id}` est identique au status envoyé.
    - **Valide : Requirements 2.1**

- [ ] 5. Endpoint `POST /todos/` — logique d'assignation admin
  - [ ] 5.1 Mettre à jour `app/api/endpoints/todos.py` — route `POST /todos/`
    - Récupérer `current_user` via la dépendance existante.
    - Si `todo.owner_id` est fourni et `current_user.role != ADMIN` → lever HTTP 403 `"Droits administrateur requis pour assigner une tâche"`.
    - Si `todo.owner_id` est fourni, vérifier l'existence de l'utilisateur cible → HTTP 404 `"Utilisateur cible non trouvé"` si absent.
    - Calculer `effective_owner_id = todo.owner_id or current_user.id` et appeler `crud_todo.create_todo(db, todo, user_id=effective_owner_id)`.
    - _Requirements : 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.2 Écrire le test de propriété P5 — Rejet de l'assignation par un non-admin
    - **Propriété 5 : Rejet de l'assignation par un non-admin**
    - `@given(st.integers(min_value=1))` pour `owner_id` différent de l'id de l'utilisateur.
    - Vérifier que tout utilisateur `role=user` fournissant un `owner_id` ≠ son id reçoit HTTP 403.
    - **Valide : Requirements 3.4**

  - [ ]* 5.3 Écrire le test de propriété P1 — Round-trip du statut à la création
    - **Propriété 1 : Round-trip du statut d'une tâche**
    - `@given(st.sampled_from(StatusEnum), st.text(min_size=1), st.text(), st.sampled_from(PriorityEnum))`.
    - Créer une tâche avec un status donné, la récupérer et vérifier que le status retourné est identique.
    - Vérifier que la création sans status retourne `en_cours`.
    - **Valide : Requirements 1.3, 1.5**

- [ ] 6. Endpoint `PUT /todos/{id}` — persistance du statut
  - [ ] 6.1 Vérifier et mettre à jour `app/api/endpoints/todos.py` — route `PUT /todos/{id}`
    - S'assurer que le schéma `TodoCreate` (avec `status`) est bien utilisé pour la mise à jour.
    - Vérifier que la logique d'autorisation retourne HTTP 404 si la tâche n'appartient pas à `current_user`.
    - _Requirements : 2.1, 2.2, 2.3_

  - [ ]* 6.2 Écrire le test de propriété P3 — Isolation des tâches entre utilisateurs
    - **Propriété 3 : Isolation des tâches entre utilisateurs**
    - `@given(st.integers(min_value=1), st.integers(min_value=1))` avec deux users distincts.
    - Vérifier que toute tentative de modification d'une tâche appartenant à un autre utilisateur retourne HTTP 404.
    - **Valide : Requirements 2.3**

- [ ] 7. Endpoint `POST /users/` — restriction aux admins
  - [ ] 7.1 Mettre à jour `app/api/endpoints/users.py` — route `POST /users/`
    - Ajouter la dépendance `get_current_user` → HTTP 401 si token absent ou invalide.
    - Vérifier `current_user.role == ADMIN` → HTTP 403 `"Droits administrateur requis"` sinon.
    - Vérifier l'unicité de l'email → HTTP 400 `"Email déjà enregistré"` si doublon.
    - Appeler `crud_user.create_user(db, user)` et retourner `UserResponse`.
    - _Requirements : 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.2 Écrire le test de propriété P7 — Protection de `POST /users/` contre les non-admins
    - **Propriété 7 : Protection de POST /users/ contre les non-admins**
    - `@given(st.builds(UserCreate, ...))` avec utilisateur `role=user` authentifié.
    - Vérifier que toute requête d'un non-admin retourne HTTP 403 avec le message `"Droits administrateur requis"`.
    - **Valide : Requirements 4.2**

  - [ ]* 7.3 Écrire le test de propriété P6 — Création d'utilisateur avec rôle — round-trip
    - **Propriété 6 : Création d'utilisateur avec rôle — round-trip**
    - `@given(st.sampled_from(RoleEnum), st.text(min_size=1), st.emails())`.
    - Vérifier que le `role` dans `UserResponse` correspond exactement au rôle fourni (ou `user` si absent).
    - **Valide : Requirements 4.3, 4.5**

  - [ ]* 7.4 Écrire les tests unitaires de l'endpoint `POST /users/`
    - HTTP 401 sans token.
    - HTTP 400 sur email dupliqué.
    - HTTP 404 sur `owner_id` inexistant (test croisé avec `POST /todos/`).
    - _Requirements : 4.1, 4.4_

- [ ] 8. Point de contrôle backend — vérifier que tous les tests passent
  - S'assurer que tous les tests backend passent. Poser des questions si nécessaire.

- [ ] 9. Types TypeScript — mise à jour de `frontend/src/types/index.ts`
  - Ajouter le type `Status = 'en_cours' | 'a_tester' | 'approuve'`.
  - Ajouter le champ `status: Status` dans le type `Todo`.
  - _Requirements : 5.1_

- [ ] 10. Service API — mise à jour de `frontend/src/services/api.ts`
  - [ ] 10.1 Mettre à jour `createTodo` pour transmettre `status` et `owner_id` (si fourni) dans le corps JSON.
    - _Requirements : 6.6, 9.5_

  - [ ] 10.2 Mettre à jour `updateTodo` pour transmettre `status` dans le corps JSON.
    - _Requirements : 6.6_

  - [ ] 10.3 Ajouter la fonction `createUser(data, token)` qui envoie `POST /users/` avec le token Bearer et les champs `name`, `email`, `password`, `role`.
    - _Requirements : 8.6_

- [ ] 11. Composant `TaskModal` — sélecteur de statut et sélecteur d'assignation
  - [ ] 11.1 Mettre à jour `TaskFormData` dans `frontend/src/components/TaskModal.tsx`
    - Ajouter `status: Status` et `owner_id?: number` dans l'interface `TaskFormData`.
    - _Requirements : 6.5_

  - [ ] 11.2 Ajouter le sélecteur de statut dans le formulaire
    - Afficher un `<select>` avec les options `"En cours"` (`en_cours`), `"À tester"` (`a_tester`), `"Approuvé"` (`approuve`).
    - Pré-sélectionner `en_cours` en mode création, `initialData.status` en mode édition.
    - Inclure la valeur dans les données soumises à `onSubmit`.
    - _Requirements : 6.1, 6.2, 6.3, 6.4_

  - [ ] 11.3 Ajouter les nouvelles props et le sélecteur "Assigner à" (admin)
    - Ajouter les props `users?`, `currentUserId?`, `isAdmin?` à `TaskModalProps`.
    - Afficher le sélecteur "Assigner à" uniquement si `isAdmin === true`.
    - Pré-sélectionner `currentUserId` en mode création admin, `initialData.owner_id` en mode édition.
    - Inclure `owner_id` dans les données soumises si admin.
    - _Requirements : 9.1, 9.2, 9.3, 9.4_

  - [ ]* 11.4 Écrire le test de propriété P9 — Round-trip du statut dans le formulaire
    - **Propriété 9 : Round-trip du statut dans le formulaire TaskModal**
    - `fc.constantFrom('en_cours', 'a_tester', 'approuve')` pour le status initial.
    - Vérifier que le sélecteur pré-sélectionne le status fourni et que la soumission transmet ce même status.
    - **Valide : Requirements 6.3, 6.4**

  - [ ]* 11.5 Écrire le test de propriété P11 — Visibilité conditionnelle du sélecteur d'assignation
    - **Propriété 11 : Visibilité conditionnelle du sélecteur d'assignation**
    - `fc.boolean()` pour `isAdmin` + `fc.array(fc.record({ id: fc.integer(), name: fc.string() }))`.
    - Vérifier que le sélecteur est visible si et seulement si `isAdmin === true`.
    - **Valide : Requirements 9.1, 9.4**

  - [ ]* 11.6 Écrire le test de propriété P12 — Pré-sélection et transmission du `owner_id`
    - **Propriété 12 : Pré-sélection et transmission du owner_id (admin)**
    - `fc.integer({ min: 1 })` pour `currentUserId`.
    - Vérifier que le sélecteur pré-sélectionne `currentUserId` en mode création admin et que la soumission transmet ce `owner_id`.
    - **Valide : Requirements 9.2, 9.3**

- [ ] 12. Page `TasksPage` — colonne "Statut" et props admin
  - [ ] 12.1 Ajouter la colonne "Statut" dans le tableau de `frontend/src/pages/TasksPage.tsx`
    - Implémenter la fonction `statusBadge(status: Status)` retournant un badge coloré :
      - `en_cours` → `bg-gradient-info` + `"En cours"`
      - `a_tester` → `bg-gradient-warning` + `"À tester"`
      - `approuve` → `bg-gradient-success` + `"Approuvé"`
    - Ajouter la colonne dans le tableau.
    - _Requirements : 5.2, 5.3, 5.4, 5.5_

  - [ ] 12.2 Ajouter la détection du rôle admin et l'alimentation du `TaskModal`
    - Appeler `getProfile()` au montage pour détecter le rôle.
    - Si admin : appeler `getUsers()` pour alimenter le sélecteur d'assignation.
    - Passer les props `isAdmin`, `users`, `currentUserId` au `TaskModal`.
    - _Requirements : 9.1, 9.2_

  - [ ]* 12.3 Écrire le test de propriété P8 — Badge de statut cohérent
    - **Propriété 8 : Badge de statut cohérent avec la valeur**
    - `fc.constantFrom('en_cours', 'a_tester', 'approuve')` + données Todo aléatoires.
    - Vérifier que chaque valeur de status produit la classe CSS et le libellé attendus.
    - **Valide : Requirements 5.3, 5.4, 5.5**

  - [ ]* 12.4 Écrire les tests unitaires de `TasksPage`
    - Vérifier que la colonne "Statut" est présente dans le tableau.
    - Vérifier le rendu des trois badges avec les bonnes couleurs et libellés.
    - _Requirements : 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Page `DashboardPage` — carte "Approuvé" et props admin
  - [ ] 13.1 Remplacer la carte "Priorité basse" par la carte "Approuvé" dans `frontend/src/pages/DashboardPage.tsx`
    - Calculer `stats.approuve = todos.filter(t => t.status === 'approuve').length`.
    - Afficher `"—"` pendant le chargement.
    - Utiliser la couleur `bg-gradient-success` pour l'icône.
    - _Requirements : 7.1, 7.2, 7.3_

  - [ ] 13.2 Ajouter la détection du rôle admin et les props admin au `TaskModal`
    - Appeler `getProfile()` au montage.
    - Passer les props `isAdmin`, `users`, `currentUserId` au `TaskModal` si admin.
    - _Requirements : 9.1_

  - [ ]* 13.3 Écrire le test de propriété P10 — Compteur "Approuvé" du Dashboard
    - **Propriété 10 : Compteur "Approuvé" du Dashboard**
    - `fc.array(fc.record({ status: fc.constantFrom('en_cours', 'a_tester', 'approuve') }))`.
    - Vérifier que le compteur affiché est égal au nombre exact de tâches avec `status === 'approuve'`.
    - **Valide : Requirements 7.1**

  - [ ]* 13.4 Écrire les tests unitaires de `DashboardPage`
    - Vérifier l'affichage de `"—"` pendant le chargement.
    - Vérifier le calcul correct du compteur "Approuvé".
    - _Requirements : 7.1, 7.2_

- [ ] 14. Page `EmployeesPage` — bouton et formulaire de création de compte
  - [ ] 14.1 Ajouter la détection du rôle admin dans `frontend/src/pages/EmployeesPage.tsx`
    - Appeler `getProfile()` au montage pour détecter le rôle.
    - Afficher le bouton "Créer un compte" uniquement si `role === 'admin'`.
    - _Requirements : 8.1_

  - [ ] 14.2 Implémenter le formulaire de création de compte
    - Afficher un formulaire (inline ou modal) avec les champs : nom, email, mot de passe, rôle.
    - À la soumission, appeler `apiService.createUser()` avec le token de l'admin.
    - En cas de succès : fermer le formulaire, afficher un message de confirmation, recharger la liste.
    - En cas d'échec : afficher le message d'erreur sans fermer le formulaire.
    - _Requirements : 8.2, 8.3, 8.4, 8.5_

  - [ ]* 14.3 Écrire le test de propriété P13 — Visibilité du bouton "Créer un compte"
    - **Propriété 13 : Visibilité du bouton "Créer un compte" selon le rôle**
    - `fc.constantFrom('admin', 'user')` pour le rôle.
    - Vérifier que le bouton est visible pour `admin` et absent du DOM pour `user`.
    - **Valide : Requirements 8.1**

  - [ ]* 14.4 Écrire le test de propriété P14 — Soumission du formulaire de création de compte
    - **Propriété 14 : Soumission du formulaire de création de compte**
    - `fc.record({ name: fc.string({ minLength: 1 }), email: fc.emailAddress(), role: fc.constantFrom('user', 'admin') })`.
    - Vérifier que `apiService.createUser` est appelé avec exactement les données saisies et que la liste est rechargée après succès.
    - **Valide : Requirements 8.3**

  - [ ]* 14.5 Écrire les tests unitaires de `EmployeesPage`
    - Vérifier l'affichage du formulaire après clic sur "Créer un compte".
    - Vérifier la fermeture du formulaire et le message de confirmation après succès.
    - Vérifier l'affichage du message d'erreur sans fermeture en cas d'échec.
    - _Requirements : 8.2, 8.4, 8.5_

- [ ] 15. Suppression de la page d'inscription publique
  - [ ] 15.1 Supprimer le composant `SignupPage` et retirer son import de `frontend/src/App.tsx`
    - Supprimer la route `/signup` de `App.tsx`.
    - Supprimer l'import `SignupPage`.
    - Supprimer le fichier `SignupPage.tsx` (ou équivalent).
    - _Requirements : 10.1, 10.4_

  - [ ] 15.2 Supprimer le lien "Sign up" dans `frontend/src/pages/LoginPage.tsx`
    - Retirer le lien ou le bouton pointant vers `/signup`.
    - _Requirements : 10.2_

  - [ ]* 15.3 Écrire les tests unitaires de suppression de l'inscription publique
    - Vérifier l'absence du lien `/signup` dans `LoginPage`.
    - Vérifier que la navigation vers `/signup` redirige vers `/` (route catch-all).
    - _Requirements : 10.2, 10.3_

- [ ] 16. Point de contrôle final — vérifier que tous les tests passent
  - S'assurer que tous les tests backend et frontend passent. Poser des questions si nécessaire.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide.
- Chaque tâche référence les requirements correspondants pour la traçabilité.
- Les tests de propriétés utilisent **Hypothesis** (backend Python) et **fast-check** (frontend TypeScript).
- Les tests unitaires utilisent **pytest** (backend) et **Vitest + React Testing Library** (frontend).
- Les points de contrôle (tâches 8 et 16) garantissent une validation incrémentale.

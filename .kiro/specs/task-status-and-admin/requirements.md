# Document de Requirements

## Introduction

Cette fonctionnalité enrichit la plateforme de gestion d'équipe sur trois axes complémentaires :

1. **Statuts de tâches** : chaque tâche dispose désormais d'un cycle de vie explicite (`en_cours`, `a_tester`, `approuve`), visible dans l'interface et modifiable par l'utilisateur assigné.
2. **Assignation de tâches par un admin** : lors de la création d'une tâche, un administrateur peut choisir à quel utilisateur l'assigner, au lieu de se limiter à lui-même.
3. **Restriction de la création de comptes** : l'inscription publique est supprimée ; seul un administrateur authentifié peut créer de nouveaux comptes utilisateurs, depuis la page Employés.

Ces changements touchent le backend (modèle `Tache`, schémas Pydantic, CRUD, endpoints) et le frontend (types TypeScript, service API, composants et pages).

---

## Glossaire

- **Système** : l'application web de gestion d'équipe (backend FastAPI + frontend React).
- **API** : le backend FastAPI exposant les endpoints REST.
- **Frontend** : l'application React/TypeScript consommant l'API.
- **Tache** : entité représentant une tâche dans la base de données (table `taches`).
- **StatusEnum** : énumération Python définissant les valeurs autorisées pour le statut d'une tâche : `en_cours`, `a_tester`, `approuve`.
- **Status** : type TypeScript correspondant à `StatusEnum` côté frontend : `'en_cours' | 'a_tester' | 'approuve'`.
- **Admin** : utilisateur dont le champ `role` vaut `RoleEnum.ADMIN`.
- **Utilisateur_Connecte** : utilisateur authentifié dont le token JWT est valide.
- **TodoCreate** : schéma Pydantic utilisé pour la création et la mise à jour d'une tâche.
- **TodoResponse** : schéma Pydantic utilisé pour retourner une tâche dans les réponses API.
- **UserCreate** : schéma Pydantic utilisé pour la création d'un compte utilisateur.
- **TaskModal** : composant React affichant le formulaire de création/modification d'une tâche.
- **TasksPage** : page React `/tasks` listant les tâches de l'utilisateur connecté.
- **DashboardPage** : page React `/` affichant les statistiques et les tâches récentes.
- **EmployeesPage** : page React `/employees` listant les membres de l'équipe (accessible aux admins).
- **LoginPage** : page React `/login` permettant l'authentification.
- **Badge_Statut** : élément visuel coloré indiquant le statut d'une tâche dans l'interface.

---

## Requirements

### Requirement 1 : Champ statut sur le modèle de tâche (backend)

**User Story :** En tant que développeur, je veux que le modèle `Tache` possède un champ `status` avec une valeur par défaut, afin que toutes les tâches aient un statut défini dès leur création.

#### Acceptance Criteria

1. THE **Système** SHALL définir une énumération `StatusEnum` avec les valeurs `en_cours`, `a_tester` et `approuve` dans `app/models/todo.py`.
2. THE **Système** SHALL ajouter une colonne `status` de type `StatusEnum` sur la table `taches`, avec la valeur par défaut `en_cours` et la contrainte `nullable=False`.
3. WHEN une tâche est créée sans valeur de `status` explicite, THE **API** SHALL persister la valeur `en_cours` pour ce champ.
4. THE **TodoCreate** SHALL exposer un champ `status` de type `StatusEnum` avec la valeur par défaut `en_cours`.
5. THE **TodoResponse** SHALL inclure le champ `status` dans chaque réponse retournée par l'API.

---

### Requirement 2 : Modification du statut d'une tâche (backend)

**User Story :** En tant qu'utilisateur connecté, je veux pouvoir modifier le statut de mes tâches via l'API, afin de refléter l'avancement de mon travail.

#### Acceptance Criteria

1. WHEN l'**Utilisateur_Connecte** envoie une requête `PUT /todos/{id}` avec un champ `status` valide, THE **API** SHALL mettre à jour le statut de la tâche correspondante en base de données.
2. WHEN l'**Utilisateur_Connecte** envoie une requête `PUT /todos/{id}` avec une valeur de `status` absente du `StatusEnum`, THE **API** SHALL retourner une erreur HTTP 422 avec un message descriptif.
3. WHEN l'**Utilisateur_Connecte** tente de modifier une tâche qui ne lui appartient pas, THE **API** SHALL retourner une erreur HTTP 404.
4. THE **API** SHALL mettre à jour la fonction `update_todo` dans `app/crud/crud_todo.py` pour persister le champ `status` lors d'une mise à jour.

---

### Requirement 3 : Assignation de tâches par un admin (backend)

**User Story :** En tant qu'administrateur, je veux pouvoir créer une tâche et l'assigner à n'importe quel utilisateur, afin de répartir le travail au sein de l'équipe.

#### Acceptance Criteria

1. THE **TodoCreate** SHALL exposer un champ optionnel `owner_id` de type entier, avec la valeur par défaut `None`.
2. WHEN un **Admin** envoie une requête `POST /todos/` avec un `owner_id` valide, THE **API** SHALL créer la tâche en assignant le `owner_id` fourni comme propriétaire.
3. WHEN un **Admin** envoie une requête `POST /todos/` sans `owner_id`, THE **API** SHALL créer la tâche en assignant l'identifiant de l'**Admin** comme propriétaire.
4. WHEN un **Utilisateur_Connecte** non-admin envoie une requête `POST /todos/` avec un `owner_id` différent de son propre identifiant, THE **API** SHALL retourner une erreur HTTP 403.
5. WHEN un **Admin** envoie une requête `POST /todos/` avec un `owner_id` qui ne correspond à aucun utilisateur existant, THE **API** SHALL retourner une erreur HTTP 404 avec le message `"Utilisateur cible non trouvé"`.

---

### Requirement 4 : Restriction de la création de comptes (backend)

**User Story :** En tant qu'administrateur, je veux être le seul à pouvoir créer de nouveaux comptes, afin de contrôler l'accès à la plateforme.

#### Acceptance Criteria

1. WHEN une requête `POST /users/` est reçue sans token d'authentification valide, THE **API** SHALL retourner une erreur HTTP 401.
2. WHEN un **Utilisateur_Connecte** non-admin envoie une requête `POST /users/`, THE **API** SHALL retourner une erreur HTTP 403 avec le message `"Droits administrateur requis"`.
3. WHEN un **Admin** envoie une requête `POST /users/` avec des données valides, THE **API** SHALL créer le compte et retourner un objet `UserResponse` avec le statut HTTP 200.
4. WHEN un **Admin** envoie une requête `POST /users/` avec un email déjà enregistré, THE **API** SHALL retourner une erreur HTTP 400 avec le message `"Email déjà enregistré"`.
5. THE **API** SHALL accepter un champ optionnel `role` dans `UserCreate` pour permettre à l'**Admin** de définir le rôle du nouveau compte (`user` ou `admin`), avec la valeur par défaut `user`.

---

### Requirement 5 : Affichage du statut dans la page Tâches (frontend)

**User Story :** En tant qu'utilisateur, je veux voir le statut de chaque tâche dans le tableau de la page `/tasks`, afin de connaître l'état d'avancement de mes tâches en un coup d'œil.

#### Acceptance Criteria

1. THE **Frontend** SHALL ajouter le type `Status` (`'en_cours' | 'a_tester' | 'approuve'`) dans `frontend/src/types/index.ts` et inclure le champ `status: Status` dans le type `Todo`.
2. THE **TasksPage** SHALL afficher une colonne "Statut" dans le tableau des tâches.
3. WHEN le statut d'une tâche est `en_cours`, THE **TasksPage** SHALL afficher un **Badge_Statut** de couleur bleue avec le libellé `"En cours"`.
4. WHEN le statut d'une tâche est `a_tester`, THE **TasksPage** SHALL afficher un **Badge_Statut** de couleur orange avec le libellé `"À tester"`.
5. WHEN le statut d'une tâche est `approuve`, THE **TasksPage** SHALL afficher un **Badge_Statut** de couleur verte avec le libellé `"Approuvé"`.

---

### Requirement 6 : Sélecteur de statut dans le formulaire de tâche (frontend)

**User Story :** En tant qu'utilisateur, je veux pouvoir choisir ou modifier le statut d'une tâche depuis le formulaire de création/modification, afin de définir son état dès la création ou de le faire évoluer.

#### Acceptance Criteria

1. THE **TaskModal** SHALL afficher un sélecteur de statut avec les options `"En cours"`, `"À tester"` et `"Approuvé"`.
2. WHEN le **TaskModal** est ouvert en mode création, THE **TaskModal** SHALL pré-sélectionner la valeur `en_cours` dans le sélecteur de statut.
3. WHEN le **TaskModal** est ouvert en mode édition, THE **TaskModal** SHALL pré-sélectionner le statut actuel de la tâche dans le sélecteur.
4. WHEN l'utilisateur soumet le formulaire, THE **TaskModal** SHALL inclure la valeur du statut sélectionné dans les données envoyées à l'API.
5. THE **Frontend** SHALL mettre à jour `TaskFormData` dans `TaskModal.tsx` pour inclure le champ `status` de type `Status`.
6. THE **Frontend** SHALL mettre à jour `createTodo` et `updateTodo` dans `frontend/src/services/api.ts` pour transmettre le champ `status` dans le corps de la requête.

---

### Requirement 7 : Carte de statistiques "Approuvé" sur le Dashboard (frontend)

**User Story :** En tant qu'utilisateur, je veux voir le nombre de tâches approuvées sur le dashboard, afin d'avoir une vue rapide de l'avancement global.

#### Acceptance Criteria

1. THE **DashboardPage** SHALL afficher une carte de statistiques indiquant le nombre de tâches dont le statut est `approuve`.
2. WHEN les tâches sont en cours de chargement, THE **DashboardPage** SHALL afficher `"—"` dans la carte de statistiques "Approuvé".
3. THE **DashboardPage** SHALL utiliser une couleur verte (`bg-gradient-success`) pour l'icône de la carte "Approuvé", cohérente avec le **Badge_Statut** correspondant.

---

### Requirement 8 : Création de compte depuis la page Employés (frontend — admin)

**User Story :** En tant qu'administrateur, je veux pouvoir créer un nouveau compte utilisateur depuis la page Employés, afin de gérer les accès sans passer par une page d'inscription publique.

#### Acceptance Criteria

1. WHILE l'utilisateur connecté est un **Admin**, THE **EmployeesPage** SHALL afficher un bouton "Créer un compte".
2. WHEN l'**Admin** clique sur "Créer un compte", THE **EmployeesPage** SHALL afficher un formulaire avec les champs : nom, email, mot de passe et rôle.
3. WHEN l'**Admin** soumet le formulaire avec des données valides, THE **Frontend** SHALL appeler `POST /users/` avec le token d'authentification de l'**Admin** et rafraîchir la liste des employés.
4. WHEN la création de compte réussit, THE **EmployeesPage** SHALL fermer le formulaire et afficher un message de confirmation.
5. IF la création de compte échoue (email déjà utilisé, erreur serveur), THEN THE **EmployeesPage** SHALL afficher un message d'erreur descriptif sans fermer le formulaire.
6. THE **Frontend** SHALL ajouter une fonction `createUser` dans `frontend/src/services/api.ts` qui envoie une requête `POST /users/` avec le token d'authentification.

---

### Requirement 9 : Sélecteur d'assignation dans le formulaire de tâche (frontend — admin)

**User Story :** En tant qu'administrateur, je veux pouvoir choisir à quel utilisateur assigner une tâche lors de sa création, afin de déléguer le travail directement depuis l'interface.

#### Acceptance Criteria

1. WHILE l'utilisateur connecté est un **Admin**, THE **TaskModal** SHALL afficher un sélecteur "Assigner à" listant tous les utilisateurs disponibles.
2. WHEN le **TaskModal** est ouvert en mode création par un **Admin**, THE **TaskModal** SHALL pré-sélectionner l'**Admin** lui-même dans le sélecteur "Assigner à".
3. WHEN l'**Admin** sélectionne un utilisateur dans le sélecteur "Assigner à" et soumet le formulaire, THE **TaskModal** SHALL inclure le champ `owner_id` correspondant dans les données envoyées à l'API.
4. WHILE l'utilisateur connecté n'est pas un **Admin**, THE **TaskModal** SHALL masquer le sélecteur "Assigner à".
5. THE **Frontend** SHALL mettre à jour `createTodo` dans `frontend/src/services/api.ts` pour transmettre le champ `owner_id` lorsqu'il est fourni.

---

### Requirement 10 : Suppression de la page et du lien d'inscription publique (frontend)

**User Story :** En tant qu'administrateur, je veux que la page d'inscription publique soit supprimée, afin que seuls les admins puissent créer des comptes.

#### Acceptance Criteria

1. THE **Frontend** SHALL supprimer la route `/signup` de `frontend/src/App.tsx`.
2. THE **LoginPage** SHALL ne plus afficher le lien "Sign up" pointant vers `/signup`.
3. WHEN un utilisateur navigue vers `/signup`, THE **Frontend** SHALL rediriger vers `/` (ou `/login` si non authentifié), conformément à la route catch-all existante.
4. THE **Frontend** SHALL supprimer le composant `SignupPage` et retirer son import de `App.tsx`.

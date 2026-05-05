# Document de Requirements

## Introduction

Ce document décrit les exigences fonctionnelles de la **plateforme de gestion d'équipe**, une application React/TypeScript s'appuyant sur un backend FastAPI existant. La plateforme permet à des utilisateurs authentifiés de gérer leurs tâches, de consulter la liste des membres de l'équipe et de maintenir leur profil. Le design s'inspire du thème Soft UI Dashboard. Toutes les interactions avec le serveur passent exclusivement par les endpoints backend déjà disponibles.

---

## Glossaire

- **Application** : l'application frontend React/TypeScript dans `frontend/src/`.
- **ApiService** : le module `frontend/src/services/api.ts` centralisant tous les appels HTTP vers le backend.
- **Backend** : le serveur FastAPI exposant les endpoints listés ci-dessous.
- **Token** : le jeton JWT stocké dans le `localStorage`, émis par `POST /auth/token`.
- **Utilisateur_Connecté** : l'utilisateur dont le Token est présent et valide dans le `localStorage`.
- **Tâche** : une entité Todo possédant les champs `id`, `titre`, `description`, `priority` (`low` | `medium` | `high`) et `owner_id`.
- **Employé** : tout utilisateur retourné par `GET /users/`, représenté par `id`, `name`, `email`, `role`, `is_active` et `tasks`.
- **Formulaire_Modal** : une fenêtre modale contenant un formulaire de saisie, affichée par-dessus la page courante.
- **Sidebar** : le composant de navigation latérale `frontend/src/components/Sidebar.tsx`.
- **Erreur_Backend** : le message d'erreur contenu dans le champ `detail` de la réponse JSON du Backend.
- **Route_Protégée** : une route accessible uniquement si un Token valide est présent.

---

## Requirements

### Requirement 1 : Authentification — Connexion

**User Story :** En tant qu'utilisateur, je veux me connecter avec mon email et mon mot de passe, afin d'accéder aux fonctionnalités protégées de la plateforme.

#### Critères d'acceptation

1. WHEN l'utilisateur soumet le formulaire de connexion avec un email et un mot de passe valides, THE Application SHALL appeler `POST /auth/token`, stocker le Token reçu dans le `localStorage` et rediriger vers `/`.
2. WHEN le Backend retourne une erreur `401` lors de la connexion, THE Application SHALL afficher le message d'erreur exact retourné par le Backend dans le formulaire de connexion.
3. WHEN le Backend retourne une erreur autre que `401` lors de la connexion, THE Application SHALL afficher un message d'erreur descriptif dans le formulaire de connexion.
4. WHILE le formulaire de connexion est en cours de soumission, THE Application SHALL désactiver le bouton de soumission et afficher un indicateur de chargement.
5. IF le champ email ou le champ mot de passe est vide, THEN THE Application SHALL empêcher la soumission du formulaire et indiquer les champs manquants.

---

### Requirement 2 : Authentification — Inscription

**User Story :** En tant que nouvel utilisateur, je veux créer un compte avec mon nom, mon email et un mot de passe, afin d'accéder à la plateforme.

#### Critères d'acceptation

1. WHEN l'utilisateur soumet le formulaire d'inscription avec un nom, un email et un mot de passe valides, THE Application SHALL appeler `POST /users/` et rediriger vers `/login` en cas de succès.
2. WHEN le Backend retourne une erreur lors de l'inscription (ex. email déjà utilisé), THE Application SHALL afficher le message d'Erreur_Backend exact dans le formulaire d'inscription.
3. WHILE le formulaire d'inscription est en cours de soumission, THE Application SHALL désactiver le bouton de soumission et afficher un indicateur de chargement.
4. IF le champ nom, email ou mot de passe est vide, THEN THE Application SHALL empêcher la soumission du formulaire et indiquer les champs manquants.

---

### Requirement 3 : Gestion des sessions — Expiration du Token

**User Story :** En tant qu'utilisateur, je veux être redirigé vers la page de connexion lorsque ma session expire, afin de ne pas rester bloqué sur une page inaccessible.

#### Critères d'acceptation

1. WHEN le Backend retourne une réponse HTTP `401` sur n'importe quel appel authentifié, THE ApiService SHALL supprimer le Token du `localStorage` et THE Application SHALL rediriger l'Utilisateur_Connecté vers `/login`.
2. WHEN l'Utilisateur_Connecté tente d'accéder à une Route_Protégée sans Token valide dans le `localStorage`, THE Application SHALL rediriger vers `/login`.

---

### Requirement 4 : Dashboard — Statistiques et tableau des tâches

**User Story :** En tant qu'utilisateur connecté, je veux voir un résumé de mes tâches sur le tableau de bord, afin d'avoir une vue d'ensemble rapide de mon activité.

#### Critères d'acceptation

1. WHEN l'Utilisateur_Connecté accède à `/`, THE Application SHALL appeler `GET /todos/` et afficher le nombre total de Tâches de l'Utilisateur_Connecté dans une carte de statistique.
2. WHEN l'Utilisateur_Connecté accède à `/`, THE Application SHALL afficher le nombre de Tâches de priorité `high`, `medium` et `low` dans des cartes de statistique distinctes.
3. WHEN l'Utilisateur_Connecté accède à `/`, THE Application SHALL afficher la liste des Tâches de l'Utilisateur_Connecté dans un tableau avec les colonnes : titre, description, priorité.
4. WHEN le chargement des Tâches est en cours, THE Application SHALL afficher un indicateur de chargement dans la zone du tableau.
5. IF le chargement des Tâches échoue, THEN THE Application SHALL afficher un message d'erreur descriptif dans la zone du tableau.

---

### Requirement 5 : Dashboard — Création rapide de tâche

**User Story :** En tant qu'utilisateur connecté, je veux créer une nouvelle tâche directement depuis le tableau de bord, afin d'ajouter rapidement une tâche sans changer de page.

#### Critères d'acceptation

1. WHEN l'Utilisateur_Connecté clique sur le bouton "Nouvelle tâche" du Dashboard, THE Application SHALL afficher un Formulaire_Modal de création de Tâche.
2. WHEN l'Utilisateur_Connecté soumet le Formulaire_Modal avec un titre valide, THE Application SHALL appeler `POST /todos/`, fermer le Formulaire_Modal et rafraîchir le tableau des Tâches.
3. IF le champ titre est vide lors de la soumission du Formulaire_Modal, THEN THE Application SHALL empêcher la soumission et afficher un message d'erreur sur le champ titre.
4. WHEN le Backend retourne une erreur lors de la création d'une Tâche depuis le Dashboard, THE Application SHALL afficher le message d'Erreur_Backend dans le Formulaire_Modal.
5. WHEN l'Utilisateur_Connecté ferme le Formulaire_Modal sans soumettre, THE Application SHALL fermer le Formulaire_Modal sans modifier la liste des Tâches.

---

### Requirement 6 : Page Tâches — CRUD complet

**User Story :** En tant qu'utilisateur connecté, je veux gérer l'intégralité de mes tâches sur une page dédiée, afin de créer, modifier et supprimer mes tâches facilement.

#### Critères d'acceptation

1. WHEN l'Utilisateur_Connecté accède à `/tasks`, THE Application SHALL appeler `GET /todos/` et afficher toutes les Tâches dans un tableau avec les colonnes : titre, description, priorité, actions.
2. WHEN l'Utilisateur_Connecté clique sur le bouton "Créer", THE Application SHALL afficher un Formulaire_Modal vide avec les champs : titre (obligatoire), description (optionnelle), priorité (sélecteur `low` / `medium` / `high`, valeur par défaut `medium`).
3. WHEN l'Utilisateur_Connecté soumet le formulaire de création avec un titre valide, THE Application SHALL appeler `POST /todos/` et rafraîchir le tableau des Tâches.
4. WHEN l'Utilisateur_Connecté clique sur le bouton "Modifier" d'une Tâche, THE Application SHALL afficher le Formulaire_Modal pré-rempli avec les valeurs actuelles de la Tâche.
5. WHEN l'Utilisateur_Connecté soumet le formulaire de modification, THE Application SHALL appeler `PUT /todos/{id}` et rafraîchir le tableau des Tâches.
6. WHEN l'Utilisateur_Connecté clique sur le bouton "Supprimer" d'une Tâche, THE Application SHALL afficher une boîte de dialogue de confirmation avant toute suppression.
7. WHEN l'Utilisateur_Connecté confirme la suppression, THE Application SHALL appeler `DELETE /todos/{id}` et retirer la Tâche du tableau.
8. IF le champ titre est vide lors de la soumission du formulaire de création ou de modification, THEN THE Application SHALL empêcher la soumission et afficher un message d'erreur sur le champ titre.
9. WHEN le Backend retourne une erreur lors d'une opération CRUD sur une Tâche, THE Application SHALL afficher le message d'Erreur_Backend à l'utilisateur.

---

### Requirement 7 : Page Employés — Liste et détail

**User Story :** En tant qu'utilisateur connecté, je veux consulter la liste des membres de l'équipe et leurs détails, afin de connaître les collaborateurs et leur charge de travail.

#### Critères d'acceptation

1. WHEN l'Utilisateur_Connecté accède à `/employees`, THE Application SHALL appeler `GET /users/` via `ApiService.getUsers()` et afficher la liste des Employés dans un tableau avec les colonnes : nom, email, rôle, statut actif.
2. WHEN le chargement de la liste des Employés est en cours, THE Application SHALL afficher un indicateur de chargement.
3. IF le chargement de la liste des Employés échoue, THEN THE Application SHALL afficher un message d'erreur descriptif.
4. WHEN l'Utilisateur_Connecté clique sur la ligne d'un Employé dans le tableau, THE Application SHALL appeler `GET /users/{id}` via `ApiService.getUserById(id)` et afficher les détails de l'Employé : nom, email, rôle, nombre de Tâches associées.
5. THE ApiService SHALL exposer une méthode `getUsers()` appelant `GET /users/` et retournant une liste d'objets `User`.
6. THE ApiService SHALL exposer une méthode `getUserById(id: number)` appelant `GET /users/{id}` et retournant un objet `User`.

---

### Requirement 8 : Page Profil — Affichage et modification

**User Story :** En tant qu'utilisateur connecté, je veux consulter et modifier mon profil, afin de maintenir mes informations à jour.

#### Critères d'acceptation

1. WHEN l'Utilisateur_Connecté accède à `/profile`, THE Application SHALL appeler `GET /users/me` et afficher : nom, email, rôle et la liste de ses Tâches.
2. WHEN l'Utilisateur_Connecté clique sur le bouton "Modifier le profil", THE Application SHALL afficher un formulaire pré-rempli avec le nom et l'email actuels.
3. WHEN l'Utilisateur_Connecté soumet le formulaire de modification du profil avec des valeurs valides, THE Application SHALL appeler `PUT /users/me` et mettre à jour les informations affichées.
4. WHEN le Backend retourne une erreur lors de la mise à jour du profil, THE Application SHALL afficher le message d'Erreur_Backend dans le formulaire de modification.
5. IF le champ nom ou email est vide lors de la soumission du formulaire de modification du profil, THEN THE Application SHALL empêcher la soumission et indiquer les champs manquants.

---

### Requirement 9 : Navigation — Sidebar et routes

**User Story :** En tant qu'utilisateur connecté, je veux naviguer facilement entre les pages de la plateforme, afin d'accéder rapidement à chaque section.

#### Critères d'acceptation

1. THE Sidebar SHALL afficher des liens de navigation vers : Dashboard (`/`), Tâches (`/tasks`), Employés (`/employees`) et Profil (`/profile`).
2. WHEN l'Utilisateur_Connecté clique sur un lien de la Sidebar, THE Application SHALL naviguer vers la route correspondante sans rechargement complet de la page.
3. THE Application SHALL enregistrer les routes `/tasks` et `/employees` comme Routes_Protégées dans `frontend/src/App.tsx`.
4. WHEN l'Utilisateur_Connecté est sur une page, THE Sidebar SHALL mettre en évidence le lien de navigation correspondant à la route active.

---

### Requirement 10 : Contraintes techniques — ApiService et design

**User Story :** En tant que développeur, je veux que toutes les interactions réseau passent par l'ApiService existant et que le design Soft UI Dashboard soit conservé, afin de maintenir la cohérence du code et de l'interface.

#### Critères d'acceptation

1. THE Application SHALL utiliser exclusivement l'ApiService défini dans `frontend/src/services/api.ts` pour tous les appels HTTP vers le Backend.
2. THE Application SHALL conserver les classes CSS du thème Soft UI Dashboard sur toutes les pages nouvelles et modifiées.
3. WHEN une réponse HTTP `401` est reçue par l'ApiService, THE ApiService SHALL supprimer le Token du `localStorage` avant de propager l'erreur.
4. THE Application SHALL n'utiliser que les endpoints backend listés dans le Glossaire ; aucun endpoint supplémentaire ne doit être appelé.

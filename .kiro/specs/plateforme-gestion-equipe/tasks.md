# Plan d'implémentation : Plateforme de Gestion d'Équipe

## Vue d'ensemble

Implémentation incrémentale de la plateforme de gestion d'équipe en TypeScript/React. Les fondations (types, service API, composants partagés) sont posées en premier, puis les pages sont construites dans l'ordre de leurs dépendances.

## Tâches

- [x] 1. Étendre l'ApiService avec les méthodes utilisateurs
  - Ajouter la méthode `getUsers()` dans `frontend/src/services/api.ts`
    - Appelle `GET /users/` avec le token Bearer
    - Retourne `Promise<User[]>`
    - Gère les erreurs 401 (suppression du token + propagation)
  - Ajouter la méthode `getUserById(id: number)` dans `frontend/src/services/api.ts`
    - Appelle `GET /users/{id}` avec le token Bearer
    - Retourne `Promise<User>`
    - Gère les erreurs 401 et 404
  - _Requirements : 7.5, 7.6, 10.1, 10.3_

  - [ ]* 1.1 Écrire le test de propriété pour `getUserById` (Propriété 7)
    - **Propriété 7 : Routage correct de getUserById**
    - **Valide : Requirements 7.6**
    - Pour tout entier positif `id`, vérifier que l'URL appelée contient exactement `/users/{id}`

  - [ ]* 1.2 Écrire le test de propriété pour la suppression du token sur 401 (Propriété 1)
    - **Propriété 1 : Suppression du token sur réponse 401**
    - **Valide : Requirements 3.1, 10.3**
    - Pour chaque méthode authentifiée (`getTodos`, `getProfile`, `getUsers`), vérifier que le token est supprimé du localStorage avant propagation de l'erreur

- [x] 2. Créer le composant `ConfirmDialog.tsx`
  - Créer `frontend/src/components/ConfirmDialog.tsx`
  - Implémenter les props : `isOpen`, `onConfirm`, `onCancel`, `message`, `title?`
  - Utiliser les classes Soft UI Dashboard : `modal`, `modal-dialog`, `modal-content`, `card`, `btn bg-gradient-danger`, `btn btn-outline-secondary`
  - Afficher le composant uniquement si `isOpen === true`
  - _Requirements : 6.6, 10.2_

  - [ ]* 2.1 Écrire les tests unitaires pour `ConfirmDialog`
    - Tester l'affichage conditionnel (isOpen true/false)
    - Tester l'appel de `onConfirm` au clic sur "Confirmer"
    - Tester l'appel de `onCancel` au clic sur "Annuler"
    - _Requirements : 6.6_

- [x] 3. Créer le composant `TaskModal.tsx`
  - Créer `frontend/src/components/TaskModal.tsx`
  - Implémenter les props : `isOpen`, `onClose`, `onSubmit`, `initialData?`, `title`
  - Champs du formulaire : Titre (obligatoire), Description (optionnelle), Priorité (sélecteur `low`/`medium`/`high`, défaut `medium`)
  - Pré-remplir les champs depuis `initialData` quand défini (mode édition)
  - Valider le titre côté client : non vide après `.trim()`, afficher l'erreur sous le champ avec `text-danger text-xs mt-1`
  - Utiliser les classes Soft UI Dashboard : `modal`, `modal-dialog`, `modal-content`, `card`, `card-header`, `card-body`, `form-control`, `btn bg-gradient-primary`
  - _Requirements : 5.1, 5.3, 6.2, 6.4, 6.8, 10.2_

  - [ ]* 3.1 Écrire le test de propriété pour le pré-remplissage du modal d'édition (Propriété 5)
    - **Propriété 5 : Pré-remplissage fidèle du formulaire d'édition de tâche**
    - **Valide : Requirements 6.4**
    - Pour toute tâche avec des valeurs arbitraires, vérifier que les champs du formulaire sont initialisés avec exactement ces valeurs

  - [ ]* 3.2 Écrire le test de propriété pour le rejet des titres whitespace (Propriété 4)
    - **Propriété 4 : Rejet des titres vides ou composés de whitespace**
    - **Valide : Requirements 5.3, 6.8**
    - Pour toute chaîne composée uniquement de whitespace, vérifier que la validation retourne `isValid === false`

  - [ ]* 3.3 Écrire les tests unitaires pour `TaskModal`
    - Tester le rendu vide en mode création
    - Tester le pré-remplissage en mode édition
    - Tester le blocage de soumission sur titre vide
    - _Requirements : 5.3, 6.2, 6.4, 6.8_

- [x] 4. Mettre à jour `Sidebar.tsx`
  - Modifier `frontend/src/components/Sidebar.tsx`
  - Remplacer les liens existants par quatre liens principaux :
    - **Dashboard** (`/`) — icône `ni-tv-2 text-primary`
    - **Tâches** (`/tasks`) — icône `ni-bullet-list-67 text-warning`
    - **Employés** (`/employees`) — icône `ni-single-02 text-dark`
    - **Profil** (`/profile`) — icône `ni-circle-08 text-info`
  - Conserver le comportement `NavLink` avec classe `active` sur la route courante
  - Supprimer les liens Sign In et Sign Up de la section principale
  - _Requirements : 9.1, 9.2, 9.4, 10.2_

  - [ ]* 4.1 Écrire les tests unitaires pour `Sidebar`
    - Vérifier la présence des 4 liens de navigation
    - Vérifier que le lien actif reçoit la classe `active` sur la route courante
    - _Requirements : 9.1, 9.4_

- [x] 5. Mettre à jour `App.tsx` avec les nouvelles routes protégées
  - Modifier `frontend/src/App.tsx`
  - Importer `TasksPage` et `EmployeesPage` (créés aux étapes suivantes)
  - Ajouter la route `/tasks` protégée par `PrivateRoute`
  - Ajouter la route `/employees` protégée par `PrivateRoute`
  - _Requirements : 9.3, 3.2, 10.1_

  - [ ]* 5.1 Écrire le test de propriété pour les routes protégées sans token (Propriété 2)
    - **Propriété 2 : Redirection des routes protégées sans token**
    - **Valide : Requirements 3.2, 9.3**
    - Pour chaque route protégée (`/`, `/tasks`, `/employees`, `/profile`), vérifier la redirection vers `/login` en l'absence de token

- [x] 6. Refondre `DashboardPage.tsx` avec les vraies statistiques et le modal de création
  - Modifier `frontend/src/pages/DashboardPage.tsx`
  - Remplacer les 4 cartes de statistiques statiques par des valeurs calculées depuis `GET /todos/` :
    - Carte 1 : Total des tâches
    - Carte 2 : Tâches priorité `high` (icône `ni-fat-remove`, couleur `bg-gradient-danger`)
    - Carte 3 : Tâches priorité `medium` (icône `ni-time-alarm`, couleur `bg-gradient-warning`)
    - Carte 4 : Tâches priorité `low` (icône `ni-check-bold`, couleur `bg-gradient-success`)
  - Ajouter un bouton "Nouvelle tâche" (`btn bg-gradient-primary`) dans l'en-tête du tableau
  - Intégrer `TaskModal` en mode création : ouvrir au clic, appeler `apiService.createTodo()`, rafraîchir le tableau, fermer le modal
  - Afficher un indicateur de chargement pendant le fetch
  - Afficher un message d'erreur descriptif si le chargement échoue
  - _Requirements : 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 10.2_

  - [ ]* 6.1 Écrire le test de propriété pour la cohérence des compteurs de priorité (Propriété 3)
    - **Propriété 3 : Cohérence des compteurs de priorité**
    - **Valide : Requirements 4.1, 4.2**
    - Pour toute liste de tâches générée aléatoirement, vérifier que `count(high) + count(medium) + count(low) === total`

  - [ ]* 6.2 Écrire les tests unitaires pour `DashboardPage`
    - Tester l'affichage des statistiques calculées
    - Tester l'ouverture du modal au clic sur "Nouvelle tâche"
    - Tester l'indicateur de chargement
    - Tester le message d'erreur en cas d'échec du fetch
    - _Requirements : 4.1, 4.2, 4.4, 4.5, 5.1_

- [ ] 7. Point de contrôle — Vérifier les fondations
  - S'assurer que tous les tests passent, poser des questions à l'utilisateur si nécessaire.

- [x] 8. Créer `TasksPage.tsx` avec le CRUD complet
  - Créer `frontend/src/pages/TasksPage.tsx`
  - Charger les tâches via `apiService.getTodos()` au montage du composant
  - Afficher un tableau avec les colonnes : Titre, Description, Priorité (badge coloré), Actions
  - Badges de priorité : `high` → `badge bg-gradient-danger`, `medium` → `badge bg-gradient-warning`, `low` → `badge bg-gradient-success`
  - Bouton "Créer une tâche" ouvrant `TaskModal` en mode création → appel `apiService.createTodo()` → rafraîchissement
  - Bouton "Modifier" par ligne ouvrant `TaskModal` pré-rempli → appel `apiService.updateTodo(id, data)` → rafraîchissement
  - Bouton "Supprimer" par ligne ouvrant `ConfirmDialog` → appel `apiService.deleteTodo(id)` → retrait de la ligne
  - Afficher les erreurs backend dans le modal ou sous le tableau avec `text-danger`
  - Afficher un indicateur de chargement pendant le fetch initial
  - _Requirements : 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 10.1, 10.2_

  - [ ]* 8.1 Écrire le test de propriété pour la propagation des erreurs backend (Propriété 6)
    - **Propriété 6 : Propagation des erreurs backend dans l'interface**
    - **Valide : Requirements 6.9**
    - Pour toute opération CRUD recevant une erreur backend, vérifier que le message d'erreur est affiché dans l'interface

  - [ ]* 8.2 Écrire les tests unitaires pour `TasksPage`
    - Tester le rendu du tableau avec des tâches
    - Tester l'ouverture du modal de création
    - Tester l'ouverture du modal d'édition pré-rempli
    - Tester l'affichage de `ConfirmDialog` avant suppression
    - Tester les messages d'erreur
    - _Requirements : 6.1, 6.2, 6.4, 6.6, 6.9_

- [x] 9. Créer `EmployeesPage.tsx` avec liste et panneau de détail
  - Créer `frontend/src/pages/EmployeesPage.tsx`
  - Charger la liste via `apiService.getUsers()` au montage du composant
  - Afficher un tableau avec les colonnes : Nom, Email, Rôle, Statut (badge `Actif` / `Inactif`)
  - Au clic sur une ligne, appeler `apiService.getUserById(id)` et afficher un panneau de détail (à droite ou en dessous) avec : Nom, Email, Rôle, nombre de tâches associées, liste des tâches (titre + badge priorité)
  - Afficher un indicateur de chargement pendant le fetch de la liste
  - Afficher un indicateur de chargement dans le panneau de détail pendant le fetch du détail
  - Afficher un message d'erreur descriptif si le chargement de la liste échoue
  - Afficher un message d'erreur dans le panneau de détail si le fetch du détail échoue
  - _Requirements : 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.1, 10.2_

  - [ ]* 9.1 Écrire les tests unitaires pour `EmployeesPage`
    - Tester le rendu du tableau avec des employés
    - Tester l'affichage du panneau de détail au clic sur une ligne
    - Tester les indicateurs de chargement (liste et détail)
    - Tester les messages d'erreur
    - _Requirements : 7.1, 7.2, 7.3, 7.4_

- [x] 10. Améliorer `ProfilePage.tsx` avec le formulaire de modification
  - Modifier `frontend/src/pages/ProfilePage.tsx`
  - Charger le profil via `apiService.getProfile()` et afficher : nom, email, rôle, liste des tâches
  - Ajouter un bouton "Modifier le profil" qui affiche un formulaire inline (ou modal) pré-rempli avec le nom et l'email actuels
  - Valider côté client : nom et email non vides après `.trim()`, afficher les erreurs sous les champs avec `text-danger text-xs mt-1`
  - Soumettre via `apiService.updateProfile()` → mettre à jour les informations affichées → masquer le formulaire
  - Afficher les erreurs backend dans le formulaire
  - Afficher un message d'erreur si le chargement initial du profil échoue
  - _Requirements : 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2_

  - [ ]* 10.1 Écrire le test de propriété pour le pré-remplissage du formulaire de profil (Propriété 8)
    - **Propriété 8 : Pré-remplissage fidèle du formulaire de profil**
    - **Valide : Requirements 8.2**
    - Pour tout profil avec des valeurs arbitraires de nom et d'email, vérifier que les champs du formulaire sont initialisés avec exactement ces valeurs

  - [ ]* 10.2 Écrire le test de propriété pour le rejet des champs profil whitespace (Propriété 9)
    - **Propriété 9 : Rejet des champs profil vides ou whitespace**
    - **Valide : Requirements 8.5**
    - Pour toute combinaison de nom et/ou email composés uniquement de whitespace, vérifier que la validation retourne `isValid === false`

  - [ ]* 10.3 Écrire les tests unitaires pour `ProfilePage`
    - Tester l'affichage du profil chargé
    - Tester l'ouverture du formulaire de modification
    - Tester la soumission avec des valeurs valides
    - Tester les erreurs de validation et les erreurs backend
    - _Requirements : 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Point de contrôle final — Vérifier l'intégration complète
  - S'assurer que tous les tests passent et que la navigation entre les pages fonctionne correctement, poser des questions à l'utilisateur si nécessaire.

## Notes

- Les tâches marquées avec `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Chaque tâche référence les requirements spécifiques pour la traçabilité
- Les tests de propriétés utilisent [fast-check](https://github.com/dubzzz/fast-check) avec `numRuns: 100` minimum
- Les tests unitaires utilisent Vitest + React Testing Library
- Toutes les classes CSS doivent respecter le thème Soft UI Dashboard
- Tous les appels HTTP passent exclusivement par `apiService` dans `frontend/src/services/api.ts`

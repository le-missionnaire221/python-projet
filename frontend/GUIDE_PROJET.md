# 📘 Guide Complet du Projet API Gestion de Tâches

Ce guide a pour but de détailler l'intégralité du fonctionnement du projet afin de permettre à n'importe quel développeur de le comprendre, de l'installer et de le faire évoluer.

---

## 🏗️ 1. Présentation du Projet

Il s'agit d'une **API REST** construite avec **FastAPI** (Python). Elle permet de gérer :
*   **Des Utilisateurs** (Création, Lecture)
*   **Des Tâches** (Création, Lecture, Modification, Suppression) avec gestion des priorités.

L'architecture suit les bonnes pratiques de séparation des responsabilités (Clean Architecture simplifiée) :
*   **Models** : Définition des tables de la base de données.
*   **Schemas** : Validation des données entrantes/sortantes (Pydantic).
*   **CRUD** : Logique métier et interactions avec la base de données.
*   **API/Endpoints** : Gestion des routes HTTP.

---

## 🛠️ 2. Prérequis Techniques

Pour faire tourner ce projet, vous avez besoin de :
*   **Python 3.9+**
*   **PostgreSQL** (Base de données relationnelle)
*   **Git** (Optionnel, pour le versionning)

---

## 🚀 3. Installation et Configuration

### Étape 1 : Cloner ou récupérer le projet
Placez-vous dans le dossier du projet :
```bash
cd CRUD_API_DICT
```

### Étape 2 : Créer un environnement virtuel
Il est recommandé d'isoler les dépendances du projet.
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### Étape 3 : Installer les dépendances
```bash
pip install -r requirements.txt
```
*Le fichier `requirements.txt` contient les librairies essentielles : `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, etc.*

### Étape 4 : Configuration de la Base de Données (.env)
Créez ou modifiez le fichier `.env` à la racine du projet pour configurer l'accès à votre base PostgreSQL.

Exemple de fichier `.env` :
```env
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
```
*Assurez-vous d'avoir créé la base de données `todo_db` dans pgAdmin ou via la ligne de commande PostgreSQL.*

---

## 📂 4. Structure du Projet (Dossier `app/`)

Le code source principal se trouve dans le dossier `app`. Voici comment il est organisé :

```
app/
├── api/
│   └── endpoints/      # Routes de l'API (Controlleurs)
│       ├── todos.py    # Routes pour les tâches (/todos)
│       └── users.py    # Routes pour les utilisateurs (/users)
├── core/
│   ├── config.py       # Chargement des variables d'environnement
│   └── database.py     # Configuration de la connexion SQLAlchemy
├── crud/
│   ├── crud_todo.py    # Fonctions pour manipuler les tâches en BDD
│   └── crud_user.py    # Fonctions pour manipuler les utilisateurs en BDD
├── models/
│   ├── todo.py         # Modèle SQLAlchemy 'Tache' et Enum 'PriorityEnum'
│   └── user.py         # Modèle SQLAlchemy 'User'
├── schemas/
│   ├── todo.py         # Schémas Pydantic pour les Tâches
│   └── user.py         # Schémas Pydantic pour les Utilisateurs
├── main.py             # Point d'entrée de l'application FastAPI
└── reset_db.py         # Script utilitaire pour réinitialiser la BDD
```

---

## 💾 5. Modèles de Données

Le projet utilise **SQLAlchemy** comme ORM.

### Utilisateur (`User`)
*   **id** : Identifiant unique (Clé primaire).
*   **username** : Nom d'utilisateur.
*   **email** : Adresse email (Unique).
*   **password** : Mot de passe (Stocké tel quel pour l'instant - *À améliorer par du hachage*).
*   **taches** : Relation vers les tâches de l'utilisateur.

### Tâche (`Tache`)
*   **id** : Identifiant unique.
*   **titre** : Titre de la tâche.
*   **description** : Détails de la tâche.
*   **priority** : Priorité (LOW, MEDIUM, HIGH) - *Utilise un type Enum SQL*.
*   **owner_id** : Clé étrangère vers l'utilisateur propriétaire.

---

## ▶️ 6. Lancement de l'Application

Pour démarrer le serveur de développement avec rechargement automatique :

```bash
uvicorn app.main:app --reload
```
Le serveur sera accessible sur : `http://127.0.0.1:8000`

---

## 📖 7. Utilisation de l'API

FastAPI génère automatiquement une documentation interactive.

1.  Lancez le serveur.
2.  Ouvrez votre navigateur à l'adresse : **`http://127.0.0.1:8000/docs`**

Vous verrez l'interface **Swagger UI** qui vous permet de tester routes :

### Workflow typique pour tester :
1.  **POST /users/** : Créez un utilisateur (notez son ID).
2.  **POST /todos/** : Créez une tâche en utilisant l'ID de l'utilisateur (`owner_id`) et une priorité (`low`, `medium`, `high`).
3.  **GET /todos/** : Affichez toutes les tâches.
4.  **PUT /todos/{id}** : Modifiez une tâche.
5.  **DELETE /todos/{id}** : Supprimez une tâche.

---

## 🔧 8. Maintenance et Évolutions Futures

### Réinitialiser la Base de Données
Si vous modifiez les modèles et que vous voulez repartir de zéro, un script est inclus :
```bash
python -m app.reset_db
```
*⚠️ Attention : Cela supprime toutes les données !*

### Idées d'améliorations
*   **Sécurité** : Hacher les mots de passe (avec `bcrypt`) au lieu de les stocker en clair.
*   **Authentification** : Ajouter un système de Token (JWT) pour sécuriser les routes (actuellement n'importe qui peut créer une tâche pour n'importe qui).
*   **Migrations** : Utiliser **Alembic** pour gérer les changements de schéma de base de données sans tout supprimer.

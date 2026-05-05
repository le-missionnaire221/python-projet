# 📋 Documentation du Projet API Tâches (To-Do List)

Bienvenue dans la documentation de l'API de gestion de tâches. Ce projet a été restructuré pour suivre une architecture professionnelle, modulaire et sécurisée, idéale pour une application d'entreprise.

## 🏗️ Structure du Projet

L'architecture suit une séparation claire des responsabilités (Clean Architecture / MVC simplifié) :

```
CRUD_API_DICT/
├── app/
│   ├── api/
│   │   └── endpoints/    # Les routes (URLs) de l'API. C'est ici que sont définis les points d'entrée (GET, POST, etc.).
│   ├── core/             # Le cœur de l'app : configuration, connexion BDD, sécurité.
│   ├── crud/             # (Create, Read, Update, Delete) : Contient toute la logique métier et les requêtes BDD.
│   ├── models/           # Les modèles SQLAlchemy qui définissent les tables de la base de données.
│   ├── schemas/          # Les modèles Pydantic pour la validation des données entrantes et sortantes.
│   └── main.py           # Le point d'entrée principal qui lance l'application FastAPI.
├── legacy/               # Contient les anciens fichiers (backup).
├── .env                  # Fichier contenant les secrets (non partagé sur Git).
├── .gitignore            # Liste des fichiers à ignorer par Git.
├── requirements.txt      # Liste des librairies Python nécessaires.
└── README.md             # Ce fichier de documentation.
```

## 🚀 Installation et Configuration

### 1. Prérequis
- Python 3.8 ou supérieur
- PostgreSQL installé et configuré

### 2. Installation des dépendances

Installez les librairies listées dans `requirements.txt` :

```bash
pip install -r requirements.txt
```

### 3. Configuration de l'environnement

Le projet utilise un fichier `.env` pour sécuriser les informations sensibles. Assurez-vous que ce fichier existe à la racine du projet avec le contenu suivant :

```ini
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
```

> **Note :** Ne jamais commiter ce fichier `.env` sur GitHub ou GitLab.

## ▶️ Démarrage de l'application

Pour lancer le serveur de développement avec rechargement automatique :

```bash
uvicorn app.main:app --reload
```

L'API sera accessible à l'adresse : `http://127.0.0.1:8000`

## 📚 Documentation API (Swagger)

FastAPI génère automatiquement une documentation interactive. Une fois le serveur lancé, visitez :

- **Swagger UI** : [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc** : [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## 🛠️ Détails Techniques

### Base de Données
- **ORM** : SQLAlchemy est utilisé pour interagir avec la base de données PostgreSQL.
- **Migration** : Les tables sont créées automatiquement au démarrage via `Base.metadata.create_all` (dans `app/main.py`).

### Gestion des Tâches (Endpoints)
Les routes sont définies dans `app/api/endpoints/todos.py` :
- `GET /todos/` : Récupérer toutes les tâches.
- `GET /todos/{id}` : Récupérer une tâche spécifique.
- `POST /todos/` : Créer une nouvelle tâche.
- `PUT /todos/{id}` : Mettre à jour une tâche existante.
- `DELETE /todos/{id}` : Supprimer une tâche.

### Sécurité CORS
Le middleware CORS est configuré dans `app/main.py` pour autoriser les requêtes provenant de n'importe quelle origine (`allow_origins=["*"]`), ce qui est utile pour le développement mobile (Flutter) ou frontend.

## 🔄 Workflow de Développement
1.  Définir le modèle de données dans `app/models/`.
2.  Créer les schémas de validation dans `app/schemas/`.
3.  Implémenter la logique métier dans `app/crud/`.
4.  Exposer la fonctionnalité via une route dans `app/api/endpoints/`.

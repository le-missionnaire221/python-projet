# Importation de la classe FastAPI depuis le module fastapi (le framework web qu'on utilise)
from fastapi import FastAPI
# Importation du middleware CORS pour autoriser les requêtes cross-origin (depuis d'autres domaines)
from fastapi.middleware.cors import CORSMiddleware
# Importation des paramètres de configuration de l'application (comme le nom, la version)
from app.core.config import settings
# Importation du moteur de base de données (engine) et de la classe de base (Base) pour SQLAlchemy
from app.core.database import engine, Base
# Importation des différents routeurs qui contiennent nos endpoints (todos, users, et auth)
from app.api.endpoints import todos, users, auth

# Créer toutes les tables dans la base de données au démarrage de l'application
# Note : En environnement de production, on utiliserait un outil comme Alembic pour gérer les migrations de BD
Base.metadata.create_all(bind=engine)

# Instanciation de l'application FastAPI principale
app = FastAPI(
    # Le titre de l'API, récupéré depuis les paramètres de configuration
    title=settings.PROJECT_NAME,
    # La version de l'API, également récupérée depuis la configuration
    version=settings.PROJECT_VERSION
)

# ----------------- CONFIGURATION CORS -----------------
# Ajout du middleware CORS à l'application
app.add_middleware(
    CORSMiddleware,
    # Autorise toutes les origines (domaines) à requêter l'API (à restreindre en production)
    allow_origins=["*"],
    # Autorise l'envoi de cookies et d'informations d'identification
    allow_credentials=True,
    # Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
    allow_methods=["*"],
    # Autorise tous les en-têtes HTTP (headers) dans les requêtes
    allow_headers=["*"],
)

# Définition d'une route racine "/" avec la méthode GET
@app.get("/")
# Fonction exécutée lorsqu'on visite la racine de l'API
def index():
    # Retourne un dictionnaire JSON de bienvenue
    return {"message": "Bienvenue dans mon api de gestion des taches"}

# Inclusion du routeur d'authentification (pour le login/inscription) avec le préfixe d'URL '/auth'
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# Inclusion du routeur des tâches (CRUD todos) avec le préfixe d'URL '/todos'
app.include_router(todos.router, prefix="/todos", tags=["todos"])
# Inclusion du routeur des utilisateurs (CRUD users) avec le préfixe d'URL '/users'
app.include_router(users.router, prefix="/users", tags=["users"])

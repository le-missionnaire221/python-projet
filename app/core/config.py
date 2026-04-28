# Importation de 'os' pour accéder aux variables du système d'exploitation de la machine courante
import os
# Importation de 'load_dotenv' permettant de charger de fausses variables d'environnement définies dans un fichier '.env'
from dotenv import load_dotenv

# Fonction chargeant les variables d'environnement spécifiées dans le fichier .env, s'il existe (variables de session)
load_dotenv()

class Settings:
    # Nom du projet avec typage 'str' (chaîne de caractères). S'affichera par exemple dans FastAPI/Swagger.
    PROJECT_NAME: str = "Taches API"
    # Version en cours (pour repérage historique).
    PROJECT_VERSION: str = "1.0.0"
    
    # Récupération de l'URL de base de données directement si elle existe (Render, Heroku, etc.)
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    if DATABASE_URL:
        # Correction pour SQLAlchemy qui nécessite 'postgresql://' au lieu de 'postgres://'
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    else:
        # Récupération individuelle si DATABASE_URL n'est pas définie
        DB_USER: str = os.getenv("DB_USER")
        DB_PASSWORD: str = os.getenv("DB_PASSWORD")
        DB_HOST: str = os.getenv("DB_HOST", "localhost")
        DB_PORT: str = os.getenv("DB_PORT", "5432")
        DB_NAME: str = os.getenv("DB_NAME", "todo_db")
        
        # Création de l'URL de connexion finale basée sur le format standard SQLAlchemy
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Instanciation de l'objet de paramètres (singleton)
settings = Settings()

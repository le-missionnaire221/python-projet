# Importation de 'os' pour accéder aux variables du système d'exploitation de la machine courante
import os
# Importation de 'load_dotenv' permettant de charger de fausses variables d'environnement définies dans un fichier '.env'
from dotenv import load_dotenv

# Fonction chargeant les variables d'environnement spécifiées dans le fichier .env, s'il existe (variables de session)
load_dotenv()

# Création d'une classe globale stockant les configurations essentielles
class Settings:
    # Nom du projet avec typage 'str' (chaîne de caractères). S'affichera par exemple dans FastAPI/Swagger.
    PROJECT_NAME: str = "Taches API"
    # Version en cours (pour repérage historique).
    PROJECT_VERSION: str = "1.0.0"
    
    # Récupération de l'identifiant (user) de base de données à partir du fichier .env
    DB_USER: str = os.getenv("DB_USER")
    # Récupération du mot de passe de base de données à partir du fichier .env
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    # Si 'DB_HOST' n'existe pas dans le '.env', utilisation par défaut de "localhost" (notre propre PC d'où le serveur s'exécute)
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    # Si 'DB_PORT' n'existe pas, utilisation par défaut du port traditionnel de PostgreSQL (5432)
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    # Nom de la base de données spécifique par défaut (todo_db)
    DB_NAME: str = os.getenv("DB_NAME", "todo_db")
    
    # Création de l'URL de connexion finale basée sur le format standard SQLAlchemy pour PostgreSQL (format 'postgresql://user:password@serveur:port/base_de_donnees')
    DATABASE_URL: str = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Instanciation de l'objet de paramètres (singleton) pour que l'URL et les clés restent fixes dans toute l'application 
settings = Settings()

# Import pour créer le moteur de connexion à la base de données
from sqlalchemy import create_engine
# Imports pour configurer les sessions et définir la classe de base des modèles
from sqlalchemy.orm import sessionmaker, declarative_base
# Module pour interagir avec le système de fichiers (variables d'environnement)
import os
# Fonction pour charger les variables d'environnement depuis le fichier .env
from dotenv import load_dotenv

# Lit le fichier .env et charge ses variables en mémoire
load_dotenv()

# Récupération de l'utilisateur de la base de données
DB_USER = os.getenv("DB_USER")
# Récupération du mot de passe
DB_PASSWORD = os.getenv("DB_PASSWORD")
# Récupération de l'hôte du serveur de BDD (ex: localhost)
DB_HOST = os.getenv("DB_HOST")
# Récupération du port de la base PostgreSQL (par defaut 5432)
DB_PORT = os.getenv("DB_PORT")
# Récupération du nom de la base de données concernée
DB_NAME = os.getenv("DB_NAME")

# Formatage de la chaîne de connexion sous le format attendu par SQLAlchemy
# Format complet: postgresql://nom_utilisateur:mot_de_passe@adresse:port/nom_de_la_bdd
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Le moteur (engine) gère la connexion effective vers la BD avec l'URL configurée
engine = create_engine(DATABASE_URL)

# Création d'une usine à session (SessionLocal) paramétrée.
# autocommit et autoflush sur False signifient que c'est à nous de valider (commit) manuellement.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine # On relie la session au moteur
)

# Création de la classe Base que tous les modèles devront hériter pour être reconnus comme tels
Base = declarative_base()

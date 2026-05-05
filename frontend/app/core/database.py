# Importation d'une fonction pour générer le "moteur" central qui communiquera avec la BD
from sqlalchemy import create_engine
# Importation de sessionmaker pour configurer comment gérer les sessions, et de declarative_base pour nos modèles
from sqlalchemy.orm import sessionmaker, declarative_base
# Importation des paramètres stockant l'URL complète de connexion (user, password, port...)
from app.core.config import settings

# Création de l'engine, le point de connexion universel vers PostgreSQL en utilisant notre URL stockée
engine = create_engine(settings.DATABASE_URL)

# Création d'une "usine à sessions". autocommit=False et autoflush=False donnent le plein contrôle manuel aux endpoints de valider la BDD (.commit())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Création de la classe principale "Base", chaque table/modèle (User, Todo) dont on aura besoin en héritera
Base = declarative_base()

# Fonction/Dépendance essentielle de FastAPI pour distribuer une connexion à chaque requête API entrante
def get_db():
    # Instanciation d'une nouvelle session locale pour interagir avec la BD durant cette requête
    db = SessionLocal()
    try:
        # `yield` renvoie la session pour qu'elle puisse être utilisée par notre code dans la route
        yield db
    finally:
        # Quand l'interaction réseau est terminée (la réponse est partie), on ferme proprement la connexion
        db.close()

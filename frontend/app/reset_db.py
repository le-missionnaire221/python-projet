# Importation de 'text' depuis SQLAlchemy pour pouvoir exécuter des requêtes SQL brutes
from sqlalchemy import text
# Importation de l'engine (connexion à la BD) et de la Base de notre configuration de base de données
from app.core.database import engine, Base
# Importation du modèle Tache pour que SQLAlchemy en prenne connaissance
from app.models.todo import Tache
# Importation du modèle User pour que SQLAlchemy en prenne connaissance
from app.models.user import User

# Définition de la fonction principale chargée de réinitialiser la base de données
def reset_database():
    # Affiche un message dans la console indiquant le début de la suppression
    print("Suppression des tables existantes...")
    # Ouvre une connexion à la base de données de façon sécurisée (se ferme automatiquement après)
    with engine.connect() as connection:
        # Exécute une commande SQL pour supprimer la table 'todos' si elle existe (avec CASCADE)
        connection.execute(text("DROP TABLE IF EXISTS todos CASCADE"))
        # Exécute une commande SQL pour supprimer la table 'taches'
        connection.execute(text("DROP TABLE IF EXISTS taches CASCADE"))
        # Exécute une commande SQL pour supprimer la table 'users'
        connection.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        # Exécute une commande SQL pour supprimer le type énuméré 'priority_enum' dans PostgreSQL
        connection.execute(text("DROP TYPE IF EXISTS priority_enum CASCADE"))
        # Valide la transaction de suppression pour rendre les changements permanents
        connection.commit()
    
    # Affiche un message annonçant la création des nouvelles tables
    print("Création des nouvelles tables...")
    # Parcourt tous les modèles héritant de 'Base' et crée les tables correspondantes dans la BD
    Base.metadata.create_all(bind=engine)
    # Affiche un message de succès une fois l'opération terminée
    print("Terminé ! La base de données a été réinitialisée avec succès.")

# Vérifie si ce script est exécuté directement (et non importé comme un module)
if __name__ == "__main__":
    # Si c'est le cas, appelle la fonction pour réinitialiser la BD
    reset_database()

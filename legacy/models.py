# Importation des types de données pour définir la structure de la table
from sqlalchemy import Column, Integer, String, Text
# Importation de la 'Base' depuis database, c'est ce qui fait de cette classe un modèle SQLAlchemy valide
from database import Base

# --- Modèle des Tâches ---
class Todo(Base):
    # Nom de la table tel qu'il apparaîtra dans PostgreSQL
    __tablename__ = "todos"

    # id de la tâche : Numérique, défini comme clé primaire, avec un index d'optimisation
    todo_id = Column(Integer, primary_key=True, index=True)
    # nom de la tâche : Chaîne assez courte (100) et indispensable
    todo_name = Column(String(100), nullable=False)
    # description : Texte potentiellement long (Text), indispensable
    todo_description = Column(Text, nullable=False)



# --- Modèle Utilisateurs ---
class User(Base):
    # nom de la table dans PostgreSQL
    __tablename__ = "users"  

    # id de l'utilisateur, clé primaire
    user_id = Column(Integer, primary_key=True, index=True)
    # nom d'utilisateur, qui doit être absolument unique sur tout le système
    username = Column(String(50), unique=True, nullable=False)
    # adresse email, qui sert aussi potentiellement d'identifiant et doit être unique
    email = Column(String(100), unique=True, nullable=False)
    # mot de passe stocké sous forme de hash
    password = Column(String(100), nullable=False)
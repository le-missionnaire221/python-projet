# Importation des colonnes et de leurs types de données depuis SQLAlchemy
from sqlalchemy import Column, Integer, String, Text
# Importation de l'objet Base défini dans database.py (base de tous les modèles)
from database import Base

# --- Modèle Todo ---
class Todo(Base):
    # Dénomination de la table physique dans la BD
    __tablename__ = "todos"

    # Colonne ID : clé primaire avec un index (accélère la recherche)
    todo_id = Column(Integer, primary_key=True, index=True)
    # Colonne Titre (limite 100 char), champ obligatoire (nullable=False)
    todo_name = Column(String(100), nullable=False)
    # Colonne Description (texte long autorisé), obligatoire
    todo_description = Column(Text, nullable=False)

# --- Modèle User ---
class User(Base):
    # Nom de la table physique des utilisateurs (users)
    __tablename__ = "users"

    # Colonne ID pour un utilisateur
    user_id = Column(Integer, primary_key=True, index=True)
    # Colonne Username : doit être unique, champ obligatoire
    username = Column(String(50), unique=True, nullable=False)
    # Colonne Email : unicité obligatoire
    email = Column(String(100), unique=True, nullable=False)
    # Colonne Password : pour stocker le hash
    password = Column(String(100), nullable=False)
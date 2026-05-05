# Importation de la bibliothèque standard 'enum' pour créer des énumérations
import enum
# Importation des types de colonnes (Integer, String, Boolean, Enum) depuis SQLAlchemy pour définir notre table
from sqlalchemy import Column, Integer, String, Boolean, Enum as SqlEnum
# Importation de 'relationship' pour créer des liens (relations) entre différentes tables
from sqlalchemy.orm import relationship
# Importation de la 'Base' commune qui permet à SQLAlchemy de regrouper tous nos modèles
from app.core.database import Base

# Création d'une énumération pour les rôles des utilisateurs
class RoleEnum(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

# Définition de la classe User qui hérite de Base (représente la table 'users' en BD)
class User(Base):
    # Nom de la table dans la base de données
    __tablename__ = "users"

    # Colonne ID : entier, clé primaire (identifiant unique), avec indexation pour des recherches rapides
    id = Column(Integer, primary_key=True, index=True)
    # Colonne nom : chaîne de caractères (max 100), ne peut pas être nulle
    name = Column(String(100), nullable=False)
    # Colonne email : chaîne de caractères, doit être unique pour chaque utilisateur
    email = Column(String(150), unique=True, nullable=False)
    # Colonne mot de passe : stocke le mot de passe haché (sécurité), jamais en clair
    hashed_password = Column(String(255), nullable=False)
    # Colonne is_active : booléen pour savoir si le compte est actif (par défaut : True)
    is_active = Column(Boolean, default=True)
    # Colonne rôle : utilise l'énumération RoleEnum définissant si user/admin (par défaut : user)
    role = Column(SqlEnum(RoleEnum, name="roleenum", values_callable=lambda x: [e.value for e in x]), default=RoleEnum.USER, nullable=False)
    
    # Relation avec la table des tâches (Tache). Un utilisateur peut avoir plusieurs tâches.
    # 'back_populates' lie cette relation à la propriété 'owner' dans le modèle Tache.
    # 'cascade="all, delete-orphan"' indique que si l'utilisateur est supprimé, ses tâches le sont aussi.
    tasks = relationship("Tache", back_populates="owner", cascade="all, delete-orphan")

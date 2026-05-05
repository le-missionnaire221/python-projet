# Importation de l'Enum standard Python (renommée en PyEnum pour éviter les conflits de nom)
from enum import Enum as PyEnum
# Importation des types de colonnes (Integer, String, ForeignKey, Enum) depuis SQLAlchemy
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
# Importation de 'relationship' pour lier des modèles entre eux
from sqlalchemy.orm import relationship
# Importation de la 'Base' SQLAlchemy qui sert de parent à tous les modèles
from app.core.database import Base


# Création d'une énumération définissant les niveaux de priorité possibles
class PriorityEnum(str, PyEnum):
    # Priorité basse
    LOW = "low"
    # Priorité moyenne
    MEDIUM = "medium"
    # Priorité élevée
    HIGH = "high"


# Définition de la classe Tache qui représente une tâche dans notre application (table 'taches')
class Tache(Base):
    # Nom de la table dans la base de données PostgreSQL
    __tablename__ = "taches"

    # Colonne ID : entier, clé primaire, indexée pour des requêtes rapides
    id = Column(Integer, primary_key=True, index=True)
    # Colonne titre de la tâche : chaîne de caractères, obligatoire (nullable=False)
    titre = Column(String, nullable=False)
    # Colonne description : chaîne de caractères pour détailler la tâche (peut être vide)
    description = Column(String)

    # Colonne owner_id : clé étrangère liant la tâche à l'ID d'un utilisateur (table 'users').
    # L'option 'ondelete="CASCADE"' supprime cette tâche si l'utilisateur est supprimé au niveau de la BD
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Relation SQLAlchemy pour accéder facilement à l'objet User propriétaire de cette tâche
    owner = relationship("User", back_populates="tasks")

    # Colonne priority : utilise l'énumération PriorityEnum définie en haut
    priority = Column(
        # Indique que c'est un type Enum et lui donne le nom de type 'priority_enum' en BD
        Enum(PriorityEnum, name="priority_enum"),
        # Par défaut, une tâche a une priorité moyenne
        default=PriorityEnum.MEDIUM,
        # Ce champ est obligatoire
        nullable=False
    )

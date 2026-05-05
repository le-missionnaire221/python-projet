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
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


# Énumération définissant le cycle de vie d'une tâche
class StatusEnum(str, PyEnum):
    EN_COURS = "en_cours"
    A_TESTER = "a_tester"
    APPROUVE = "approuve"


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

    # Colonne priority : utilise l'énumération PriorityEnum définissant si low/medium/high (par défaut : medium)
    priority = Column(
        Enum(PriorityEnum, name="priority_enum", values_callable=lambda x: [e.value for e in x]),
        default=PriorityEnum.MEDIUM,
        nullable=False
    )

    # Colonne status : cycle de vie de la tâche (par défaut : en_cours)
    status = Column(
        Enum(StatusEnum, name="status_enum", values_callable=lambda x: [e.value for e in x]),
        default=StatusEnum.EN_COURS,
        nullable=False
    )

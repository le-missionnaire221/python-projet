# Importation de BaseModel de Pydantic pour la validation des données entrantes/sortantes
from pydantic import BaseModel
# Importation de Optional pour typer un champ qui peut être absent/nul
from typing import Optional
# Importation de notre Enum PriorityEnum utilisé par notre modèle de base de données
from app.models.todo import PriorityEnum, StatusEnum

# Création du schéma de base partageant des attributs communs à toutes les autres requêtes Todo
class TodoBase(BaseModel):
    titre: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    status: StatusEnum = StatusEnum.EN_COURS

class TodoCreate(TodoBase):
    owner_id: Optional[int] = None 

# Schéma utilisé pour RENVOYER la tâche créée (réponse API)
class TodoResponse(TodoBase):
    # L'ID généré par la base de données après création
    id: int
    # L'ID de l'utilisateur qui a créé la tâche
    owner_id: int

    # Configuration permettant à Pydantic de lire des données directement depuis un objet SQLAlchemy
    class Config:
        from_attributes = True

# Importation de BaseModel de Pydantic pour la validation des données entrantes/sortantes
from pydantic import BaseModel
# Importation de Optional pour typer un champ qui peut être absent/nul
from typing import Optional
# Importation de notre Enum PriorityEnum utilisé par notre modèle de base de données
from app.models.todo import PriorityEnum

# Création du schéma de base partageant des attributs communs à toutes les autres requêtes Todo
class TodoBase(BaseModel):
    # Le titre de la tâche, chaîne obligatoire
    titre: str
    # La description, qui peut être du texte ou vide (Optionnel, par défaut None)
    description: Optional[str] = None
    # La priorité, qui doit être l'un des choix de `PriorityEnum`. Par défaut MEDIUM
    priority: PriorityEnum = PriorityEnum.MEDIUM

# Schéma utilisé spécifiquement lors de la CRÉATION d'une tâche. On hérite juste des bases.
class TodoCreate(TodoBase):
    # Rien à ajouter, TodoBase contient déjà tout ce qu'il faut pour créer la tâche
    pass 

# Schéma utilisé pour RENVOYER la tâche créée (réponse API)
class TodoResponse(TodoBase):
    # L'ID généré par la base de données après création
    id: int
    # L'ID de l'utilisateur qui a créé la tâche
    owner_id: int

    # Configuration permettant à Pydantic de lire des données directement depuis un objet SQLAlchemy
    class Config:
        from_attributes = True

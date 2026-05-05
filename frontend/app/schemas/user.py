# Importation de classes Pydantic, y compris EmailStr qui valide que la chaîne est bien un format d'email
from pydantic import BaseModel, EmailStr 
# Importation de List et Optional pour les champs complexes ou optionnels
from typing import List, Optional 
# Importation du type standard Enum pour définir des rôles
from enum import Enum 
# Importation du schéma de réponse pour la Tâche, car un User contient une liste de Tâches
from app.schemas.todo import TodoResponse

# Enum Pydantic pour dicter les rôles disponibles (doit correspondre avec le modèle BD)
class RoleEnum(str, Enum): 
    # Rôle classique
    USER = "user" 
    # Rôle administrateur
    ADMIN = "admin" 

# Schéma de base commun pour l'utilisateur
class UserBase(BaseModel): 
    # Nom de l'utilisateur (valide que c'est une chaîne)
    name: str 
    # Adresse email (validée automatiquement comme étant une vraie adresse '@')
    email: EmailStr 

# Schéma utilisé spécifiquement au moment de l'inscription (POST /users)
class UserCreate(UserBase): 
    # Le mot de passe ne doit être envoyé *que* lors de la création
    password: str  # Obligatoire à l'inscription 

# Schéma utilisé pour la modification (PUT /users/{id})
class UserUpdate(BaseModel): 
    # Tous les champs sont Optionnels (si omis, la donnée en BD ne bouge pas)
    name: Optional[str] = None 
    email: Optional[EmailStr] = None 
    password: Optional[str] = None 
    role: Optional[RoleEnum] = None 

# Schéma principal pour retourner/afficher l'utilisateur sans montrer son mot de passe
class UserResponse(UserBase): 
    # On ajoute son ID auto-généré
    id: int 
    # Le statut actif/inactif
    is_active: bool 
    # Le rôle qu'il possède
    role: RoleEnum 
    # La liste de ses tâches, via le schéma TodoResponse
    tasks: List[TodoResponse] = [] 

    # Permet de convertir l'objet ORM SQLAlchemy en objet valide Pydantic
    class Config: 
        from_attributes = True 

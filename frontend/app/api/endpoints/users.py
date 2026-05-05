# Importation structurante de FastAPI : APIRouter (créer un groupe de routes), Depends (injection), HTTPException
from fastapi import APIRouter, Depends, HTTPException
# Importation de la Session de SQLAlchemy
from sqlalchemy.orm import Session
# Importation de List depuis typing pour typer nos retours (ex: liste d'utilisateurs)
from typing import List

# Import de la fonction retournant la session de base de données
from app.core.database import get_db
# Import des schémas Pydantic (validation des données entrantes/sortantes)
from app.schemas.user import UserCreate, UserResponse, UserUpdate
# Import des opérations CRUD (Create, Read, Update, Delete) pour les utilisateurs
from app.crud import crud_user
# Import de la dépendance officielle pour l'utilisateur actuel
from dependencies import get_current_user

# Initialisation d'un routeur spécifique pour les utilisateurs, qui sera inclus dans l'application principale (main.py)
router = APIRouter()

# Définition d'une route POST pour CRÉER un utilisateur. Le retour se basera automatiquement sur le schéma UserResponse.
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Vérification dans la BD si cet email est déjà associé à un compte existant
    db_user = crud_user.get_user_by_email(db, email=user.email)
    # Si oui, lève une erreur HTTP 400 (Bad Request)
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    # Sinon, on crée cet utilisateur dans la base de données et on renvoie ses informations filtrées (sans mot de passe)
    return crud_user.create_user(db=db, user=user)

# Route pour récupérer les informations de l'utilisateur ACTUELLEMENT connecté
@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

# Route pour mettre à jour les informations de l'utilisateur ACTUELLEMENT connecté
@router.put("/me", response_model=UserResponse)
def update_user_me(user_update: UserUpdate, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    return crud_user.update_user(db=db, user_id=current_user.id, user_update=user_update)

# Définition d'une route GET pour LIRE une liste d'utilisateurs. Elle renvoie une List de UserResponse.
@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Appelle la méthode CRUD pour récupérer un tableau d'utilisateurs avec pagination (skip/limit)
    users = crud_user.get_users(db, skip=skip, limit=limit)
    # Retourne la liste des utilisateurs (FastAPI s'occupe de les valider/transformer en JSON)
    return users

# Définition d'une route GET dynamique avec un paramètre d'URL (user_id) pour LIRE UN seul utilisateur
@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    # Vérification en BD via l'ID fourni
    db_user = crud_user.get_user(db, user_id=user_id)
    # Si l'utilisateur n'existe pas, on retourne une erreur 404 (non trouvé)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    # Sinon on renvoie ses informations filtrées
    return db_user

# Définition d'une route PUT pour MODIFIER/METTRE À JOUR UN utilisateur spécifique selon son ID
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    # Vérifie si l'utilisateur à modifier existe bien
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        # Erreur 404 si introuvable
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    # Demande la mise à jour via la fonction CRUD (sur la base du corps de la requête UserUpdate)
    return crud_user.update_user(db=db, user_id=user_id, user_update=user)

# Définition d'une route DELETE pour SUPPRIMER UN utilisateur spécifique
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    # Vérifie d'abord l'existence de cet utilisateur
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        # S'il n'existe pas, rien à supprimer, lève l'erreur 404
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    # Exécute la suppression réelle en base de données
    crud_user.delete_user(db=db, user_id=user_id)
    # Retourne simplement un message de succès
    return {"message": "Utilisateur supprimé avec succès"}

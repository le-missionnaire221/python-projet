# Importation des éléments de base de FastAPI : routeur, injection et gestion d'exceptions
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
# Importation de la session pour la base de données
from sqlalchemy.orm import Session
# Importation pour le typage des retours de fonctions (liste d'éléments)
from typing import List

# Importation du gestionnaire de dépendance de la base de données
from app.core.database import get_db
# Importation des schémas Pydantic pour valider l'entrée/sortie des requêtes Todo
from app.schemas.todo import TodoCreate, TodoResponse
# Importation du module gérant les actions CRUD pour les tâches
from app.crud import crud_todo
# Importation du modèle User
from app.models.user import User
# Importation de la dépendance interdisant l'accès aux utilisateurs non authentifiés
from dependencies import get_current_user

# Création du routeur local (sans prefix car ce sera défini dans le main.py)
router = APIRouter()

# Route GET '/' pour lire plusieurs tâches. Renvoie une liste d'objets au format 'TodoResponse'
@router.get("/", response_model=List[TodoResponse])
def read_todos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """GET todos — admin voit toutes les tâches, user voit seulement les siennes"""
    from app.models.user import RoleEnum
    if current_user.role == RoleEnum.ADMIN:
        return crud_todo.get_all_todos(db)
    return crud_todo.get_todos(db, user_id=current_user.id)

# Route GET '/{id}' pour lire un Todo spécifique selon son ID
@router.get("/{id}", response_model=TodoResponse)
def read_todo(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """GET todo par id pour l'utilisateur connecté"""
    # Récupération de la tâche correspondant à l'ID en s'assurant qu'elle appartient à l'utilisateur
    todo = crud_todo.get_todo(db, tache_id=id, user_id=current_user.id)
    # Si rien n'est trouvé, renvoi d'une erreur 404
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée ou non autorisée")
    # Sinon, on retourne la tâche
    return todo

# Route POST '/' pour créer un Todo. Retourne un dictionnaire standard.
@router.post("/", response_model=dict)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """POST créer un todo — admin peut assigner à un autre utilisateur via owner_id"""
    from app.models.user import RoleEnum

    # Si owner_id fourni, vérifier les droits admin
    if todo.owner_id is not None and todo.owner_id != current_user.id:
        if current_user.role != RoleEnum.ADMIN:
            raise HTTPException(status_code=403, detail="Droits administrateur requis pour assigner une tâche")
        # Vérifier que l'utilisateur cible existe
        from app.crud import crud_user
        target_user = crud_user.get_user(db, user_id=todo.owner_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="Utilisateur cible non trouvé")

    new_todo = crud_todo.create_todo(db, todo=todo, user_id=current_user.id)
    return jsonable_encoder({
        "message": "Tâche ajoutée avec succès",
        "todo": new_todo
    })

# Route PUT '/{id}' permettant de mettre à jour intégralement un Todo.
@router.put("/{id}", response_model=dict)
def update_todo(id: int, todo_data: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """PUT modifier un todo — admin peut modifier n'importe quelle tâche"""
    from app.models.user import RoleEnum
    if current_user.role == RoleEnum.ADMIN:
        todo = crud_todo.get_todo_by_id(db, tache_id=id)
    else:
        todo = crud_todo.get_todo(db, tache_id=id, user_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée ou non autorisée")
    updated_todo = crud_todo.update_todo(db, db_todo=todo, todo_in=todo_data)
    return jsonable_encoder({"message": "Tâche mise à jour avec succès", "todo": updated_todo})


@router.delete("/{id}")
def delete_todo(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """DELETE un todo — admin peut supprimer n'importe quelle tâche"""
    from app.models.user import RoleEnum
    if current_user.role == RoleEnum.ADMIN:
        todo = crud_todo.get_todo_by_id(db, tache_id=id)
    else:
        todo = crud_todo.get_todo(db, tache_id=id, user_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée ou non autorisée")
    crud_todo.delete_todo(db, db_todo=todo)
    return {"message": f"Tâche {id} supprimée avec succès"}

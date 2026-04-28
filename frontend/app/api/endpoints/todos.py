# Importation des éléments de base de FastAPI : routeur, injection et gestion d'exceptions
from fastapi import APIRouter, Depends, HTTPException
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
# Injection de la base de données ET vérification que l'utilisateur est authentifié (`current_user`)
def read_todos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """GET tous les todos de l'utilisateur connecté"""
    # Appel de la fonction CRUD pour ne récupérer que les tâches appartenant à 'current_user' (l'utilisateur connecté)
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
    """POST créer un todo pour l'utilisateur connecté"""
    # Création du todo dans la base de données en l'associant à l'utilisateur connecté via son ID
    new_todo = crud_todo.create_todo(db, todo=todo, user_id=current_user.id)
    # Retourne un message de réussite accompagné du contenu du Todo fraîchement créé
    return {
        "message": "Tâche ajoutée avec succès",
        "todo": new_todo
    }

# Route PUT '/{id}' permettant de mettre à jour intégralement un Todo.
@router.put("/{id}", response_model=dict)
def update_todo(id: int, todo_data: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """PUT modifier un todo de l'utilisateur connecté"""
    # On commence d'abord par vérifier que le todo existe bien et appartient au current_user
    todo = crud_todo.get_todo(db, tache_id=id, user_id=current_user.id)
    if not todo:
        # Erreur si inexistant / non autorisé
        raise HTTPException(status_code=404, detail="Tâche non trouvée ou non autorisée")
    
    # Appel CRUD pour écraser les anciennes valeurs par les nouvelles (todo_data)
    updated_todo = crud_todo.update_todo(db, db_todo=todo, todo_in=todo_data)
    # Retour de confirmation avec la version mise à jour du Todo
    return {
        "message": "Tâche mise à jour avec succès",
        "todo": updated_todo
    }

# Route DELETE '/{id}' pour supprimer une tâche.
@router.delete("/{id}")
def delete_todo(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """DELETE un todo de l'utilisateur connecté"""
    # Vérification habituelle de l'existence et la propriété de la tâche
    todo = crud_todo.get_todo(db, tache_id=id, user_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée ou non autorisée")
    # Si ok, exécute la suppression en BD
    crud_todo.delete_todo(db, db_todo=todo)
    # Retour d'un message prouvant à l'utilisateur que l'action a réussi
    return {"message": f"Tâche {id} supprimée avec succès"}

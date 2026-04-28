# Importation de FastAPI, et des outils de dépendance et d'erreur
from fastapi import FastAPI, Depends, HTTPException
# Importation du middleware CORS pour permettre les requêtes d'une autre origine (ex: appli mobile)
from fastapi.middleware.cors import CORSMiddleware
# Importation de Session pour communiquer avec la base de données
from sqlalchemy.orm import Session
# Importation de BaseModel de Pydantic pour valider les données JSON
from pydantic import BaseModel
# Importation de List pour spécifier des listes d'objets dans Pydantic
from typing import List

# On importe les modèles de données (notre schéma de tables SQLAlchemy)
import models
# On importe le moteur de base de données et les sessions depuis le module database local
from database import engine, SessionLocals
# Création "brute" des tables dans la base si elles n'existent pas encore
models.Base.metadata.create_all(bind=engine)

# Instanciation de l'API FastAPI
api = FastAPI()

#  CONFIGURATION CORS 
# Indispensable pour que le téléphone puisse communiquer avec le PC
api.add_middleware(
    CORSMiddleware,
    # Autorise les connexions depuis tout le monde
    allow_origins=["*"],
    # On autorise l'inclusion des credentials
    allow_credentials=True,
    # On autorise toutes les méthodes (GET, POST, etc.)
    allow_methods=["*"],
    # On autorise tous les headers (en-têtes)
    allow_headers=["*"],
)

# SCHEMAS
# Schéma de base pour nos Todo : le nom et la description
class TodoBase(BaseModel):
    todo_name: str
    todo_description: str

# Schéma hérité (identique à la base) utilisé au moment de la création
class TodoCreate(TodoBase):
    pass

# Schéma pour l'envoi vers l'extérieur : inclut l'ID auto-généré
class TodoResponse(TodoBase):
    todo_id: int
    # Permet de lire directement depuis un objet SQLAlchemy
    class Config:
        from_attributes = True

# Dépendance pour générer et fermer la session DB à chaque appel
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#  ROUTES

# Route racine (accueil)
@api.get("/")
def index():
    return {"message": "Bienvenue dans mon api de gestion des taches"}

# GET tous les todos
@api.get("/todos")
def get_todos(db: Session = Depends(get_db)):
    # Récupère tous les enregistrements depuis la table Todo
    return db.query(models.Todo).all()

# GET todo par id
@api.get("/todos/{todo_id}")
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    # Cherche l'enregistrement où l'ID correspond
    todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    if not todo:
        # Erreur 404 si non trouvé
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return todo

# POST créer un todo
@api.post("/todos")
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    # Crée un objet modèle SQLAlchemy avec les données Pydantic reçues
    new_todo = models.Todo(
        todo_name=todo.todo_name,
        todo_description=todo.todo_description
    )
    # Ajoute l'objet à la BDD
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    # On renvoie le format attendu par Flutter ou autre client
    return {
        "message": "Tâche ajoutée avec succès",
        "todo": new_todo
    }

# PUT modifier un todo
@api.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo_data: TodoCreate, db: Session = Depends(get_db)):
    # Vérifie d'abord l'existence
    todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    # Met à jour les propriétés
    todo.todo_name = todo_data.todo_name
    todo.todo_description = todo_data.todo_description
    
    db.commit()
    db.refresh(todo)
    return {
        "message": "Tâche mise à jour avec succès",
        "todo": todo
    }

# DELETE un todo
@api.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    # Vérifie l'existence
    todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    # Supprime et valide la transaction
    db.delete(todo)
    db.commit()
    return {"message": f"Tâche {todo_id} supprimée avec succès"}

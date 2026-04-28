# Importations principales de FastAPI (Framework web, gestion des dépendances et erreurs HTTP)
from fastapi import FastAPI, Depends, HTTPException
# Importation du middleware gérant les problèmes de requêtes inter-domaines (CORS)
from fastapi.middleware.cors import CORSMiddleware
# Importation de l'objet Session pour SQLAlchemy permettant l'accès la BDD
from sqlalchemy.orm import Session
# Importation de la commande 'text' de SQLAlchemy pour lancer des requêtes SQL natives
from sqlalchemy import text
# Importation de la base Pydantic servant à valider le JSON
from pydantic import BaseModel
# Importation de List (pour renvoyer des tableaux d'objets ou typer en liste)
from typing import List

# Importation du fichier models local (celui situé dans le dossier courant "legacy")
import models
# Import du moteur SQLAlchemy et de la Session depuis le fichier de BDD (legacy/database.py)
from database import engine, SessionLocal

# Crée toutes les tables correspondantes aux modèles si elles n'existent pas dans PostgreSQL
models.Base.metadata.create_all(bind=engine)

# Initialisation de notre serveurs web/application FastAPI
api = FastAPI()

# ----------------- CONFIGURATION CORS -----------------
# Indispensable pour que le téléphone puisse communiquer avec le PC 
# (car dans certains contextes, ils ne sont pas sur le même port ou la même adresse locale)
api.add_middleware(
    CORSMiddleware,
    # Autorise toutes les connexions entrantes, d'où qu'elles viennent (astérisque '*')
    allow_origins=["*"],
    # Permet le transfert de cookies/jetons
    allow_credentials=True,
    # Permet toutes méthodes (GET, PUT, POST, DELETE, etc.)
    allow_methods=["*"],
    # Permet tous les headers
    allow_headers=["*"],
)

# ----------------- SCHEMAS -----------------
# Structure d'un Todo renvoyé ou crée via l'API, définie par Pydantic
class TodoBase(BaseModel):
    # Les différents champs obligatoires
    todo_name: str
    todo_description: str

# Schéma représentant la donnée requise pour créer une tâche
class TodoCreate(TodoBase):
    pass # Rien de plus que sa classe Parente

# Schéma représentant ce que l'API va répondre au client front/mobile
class TodoResponse(TodoBase):
    # En plus, la réponse renommée inclura l'identifiant (id) auto-généré par PostgreSQL
    todo_id: int
    # Config indiquant à Pydantic d'extraire automatiquement ses attributs d'un objet formaté SQLAlchemy
    class Config:
        from_attributes = True

# Dépendance gérant le cycle de vie de la session avec la base de données
def get_db():
    # Ouvre une connexion locale par le biais d'une session
    db = SessionLocal()
    try:
        # Renvoie cette session à la route pour qu'elle l'exploite
        yield db
    finally:
        # Quand l'appel de l'API est refermé (après le return), la connexion avec la BD se ferme proprement
        db.close()

# ----------------- ROUTES -----------------

# URI basique d'accueil (Message de bienvenue)
@api.get("/")
def index():
    return {"message": "Bienvenue dans mon api de gestion des taches"}

# Route listant tous les "todos" via la méthode GET
@api.get("/todos")
# Depends(get_db) injecte automatiquement la session SQLAlchemy dans la variable 'db'
def get_todos(db: Session = Depends(get_db)):
    # Effectue une requête qui retourne absolument TOUT le contenu de la table 'todos'
    return db.query(models.Todo).all()

# Route renvoyant un Todo spécifique en fonction de sa clé 'todo_id' envoyée dans l'URL
@api.get("/todos/{todo_id}")
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    # .first() récupère la première et théoriquement unique entrée correspondant au critère
    todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    # Si le retour est False/Vide => Erreur classique 404 introuvable
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return todo

# Création d'une nouvelle entrée
@api.post("/todos")
# La méthode attend que l'utilisateur fournisse dans le payload des contraintes 'TodoCreate'
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    # Vérifier si la table est complètement vide
    count = db.query(models.Todo).count()
    if count == 0:
        # Si oui, l'API tente de remettre l'auto-incrément PostgreSQL 'todos_todo_id_seq' à 1
        try:
            db.execute(text("ALTER SEQUENCE todos_todo_id_seq RESTART WITH 1"))
        except Exception:
            # Si la séquence a un nom différent ou n'existe pas encore
            pass

    # Création de l'objet Todo SQLAlchemy avant insertion
    new_todo = models.Todo(
        todo_name=todo.todo_name,
        todo_description=todo.todo_description
    )
    # L'affecte à la session (add) et l'insert durablement (commit)
    db.add(new_todo)
    db.commit()
    # Rafraîchit l'objet pour connaitre son nouvel ID fourni par SQL, au lieu d'être 'None'
    db.refresh(new_todo)
    
    # On renvoie le format attendu par Flutter par exemple, dans un objet enveloppant (wrapper)
    return {
        "message": "Tâche ajoutée avec succès",
        "todo": new_todo
    }

# Mise à jour partielle ou totale via PUT
@api.put("/todos/{todo_id}")
# La donnée attendue dans le corps (body) via JSON respecte le format défini par TodoCreate
def update_todo(todo_id: int, todo_data: TodoCreate, db: Session = Depends(get_db)):
    # D'abord, on doit s'assurer que la tâche réclamée par cet ID existe !
    todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    # Remplacement des vieilles informations par celles soumises grâce au TodoCreate (todo_data)
    todo.todo_name = todo_data.todo_name
    todo.todo_description = todo_data.todo_description
    
    # Fixation de ces requêtes (modifications) en BDD
    db.commit()
    db.refresh(todo)
    # Renvoie un code positif au développeur Frontend
    return {
        "message": "Tâche mise à jour avec succès",
        "todo": todo
    }

# Suppression d'un objet 
@api.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    # Comme toujours on vérifie si l'ID cible est toujours en base de données
    todo = db.query(models.Todo).filter(models.Todo.todo_id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    # Ordre de Suppression 
    db.delete(todo)
    # Effectue un commit final
    db.commit()
    # Répond qu'il n'y pas eu d'erreur
    return {"message": f"Tâche {todo_id} supprimée avec succès"}

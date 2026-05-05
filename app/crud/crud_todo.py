from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.todo import Tache
from app.schemas.todo import TodoCreate

def get_todos(db: Session, user_id: int):
    return db.query(Tache).filter(Tache.owner_id == user_id).all()

def get_all_todos(db: Session):
    """Retourne toutes les tâches — réservé aux admins"""
    return db.query(Tache).all()

def get_todo(db: Session, tache_id: int, user_id: int):
    return db.query(Tache).filter(Tache.id == tache_id, Tache.owner_id == user_id).first()

def get_todo_by_id(db: Session, tache_id: int):
    """Récupère une tâche par ID sans vérification de propriétaire — pour les admins"""
    return db.query(Tache).filter(Tache.id == tache_id).first()

def create_todo(db: Session, todo: TodoCreate, user_id: int):
    count = db.query(Tache).count()
    if count == 0:
        try:
            db.execute(text("ALTER SEQUENCE taches_id_seq RESTART WITH 1"))
        except Exception:
            pass

    effective_owner_id = todo.owner_id if todo.owner_id is not None else user_id

    new_todo = Tache(
        titre=todo.titre,
        description=todo.description,
        priority=todo.priority,
        status=todo.status,
        owner_id=effective_owner_id
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

def update_todo(db: Session, db_todo: Tache, todo_in: TodoCreate):
    db_todo.titre = todo_in.titre
    db_todo.description = todo_in.description
    db_todo.priority = todo_in.priority
    db_todo.status = todo_in.status
    db.commit()
    db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, db_todo: Tache):
    db.delete(db_todo)
    db.commit()

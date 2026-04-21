# Importation de l'objet Session pour manipuler la base de données
from sqlalchemy.orm import Session
# Importation de `text` de SQLAlchemy pour l'exécution de requêtes SQL brutes si besoin
from sqlalchemy import text
# Importation du modèle de base de données 'Tache'
from app.models.todo import Tache
# Importation du schéma de validation 'TodoCreate' (données de création)
from app.schemas.todo import TodoCreate

# Fonction récupérant toutes les tâches d'un utilisateur spécifique (via user_id)
def get_todos(db: Session, user_id: int):
    # Requête sur Tache : filtre les tâches par 'owner_id', puis récupère tout le résultat (.all())
    return db.query(Tache).filter(Tache.owner_id == user_id).all()

# Fonction récupérant UNE seule tâche d'un utilisateur spécifique
def get_todo(db: Session, tache_id: int, user_id: int):
    # Filtrage multiple : doit correspondre à la fois à l'ID de la tâche ET au propriétaire (owner_id).
    # .first() arrête la requête dès qu'une tâche est trouvée et la retourne.
    return db.query(Tache).filter(Tache.id == tache_id, Tache.owner_id == user_id).first()

# Fonction permettant la création d'une nouvelle tâche dans la base
def create_todo(db: Session, todo: TodoCreate, user_id: int):
    # Compte du nombre de tâches existantes
    count = db.query(Tache).count()
    # Réinitialisation manuelle de la séquence de l'ID si la table est complètement vide (1)
    if count == 0:
        try:
            db.execute(text("ALTER SEQUENCE taches_id_seq RESTART WITH 1"))
        except Exception:
            # Passe en silence si la base de données ne le permet pas (ex: SQLite)
            pass

    # Instanciation du modèle SQLAlchemy 'Tache' avec les propriétés soumises
    new_todo = Tache(
        titre=todo.titre,
        description=todo.description,
        priority=todo.priority,
        owner_id=user_id # Liaison au créateur
    )
    # Ajout de l'objet dans la "zone de transit" (session)
    db.add(new_todo)
    # Validation (sauvegarde finale) dans la base de données réelle
    db.commit()
    # Rafraîchissement de l'objet pour récupérer les ID générés par la base de données
    db.refresh(new_todo)
    # Renvoi de la nouvelle tâche (incluant désormais son ID auto-généré)
    return new_todo

# Fonction permettant de mettre à jour une tâche existante
def update_todo(db: Session, db_todo: Tache, todo_in: TodoCreate):
    # Modification des champs : on écrase les valeurs existantes par les nouvelles (todo_in)
    db_todo.titre = todo_in.titre
    db_todo.description = todo_in.description
    db_todo.priority = todo_in.priority
    
    # Enregistrement des modifications en BD
    db.commit()
    # Actualisation du cache de l'objet
    db.refresh(db_todo)
    return db_todo

# Fonction pour supprimer une tâche spécifique
def delete_todo(db: Session, db_todo: Tache):
    # Demande la suppression de l'objet 'db_todo'
    db.delete(db_todo)
    # Valide (commit) pour réellement propager la suppression en BD
    db.commit()

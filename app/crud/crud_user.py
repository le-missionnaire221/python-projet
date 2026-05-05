# Importation de la Session SQLAlchemy pour interroger/modifier la base de données
from sqlalchemy.orm import Session 
# Importation du modèle SQLAlchemy 'User'
from app.models.user import User 
# Importation des schémas Pydantic permettant de créer ou mettre à jour un compte utilisateur
from app.schemas.user import UserCreate, UserUpdate 
# Importation de l'utilitaire depuis 'security.py' permettant de transformer le mot de passe en valeur hachée (sécurisée)
from security import get_password_hash 

# Fonction pour récupérer un utilisateur unique uniquement selon son ID
def get_user(db: Session, user_id: int):
    # Filtre la collection User par l'id et prend le 1er (.first())
    return db.query(User).filter(User.id == user_id).first()

# Fonction pour trouver un utilisateur par son adresse e-mail (surtout lors du login ou vérification doublon)
def get_user_by_email(db: Session, email: str):
    # Filtre de la même manière, mais via la colonne email
    return db.query(User).filter(User.email == email).first()

# Fonction retournant une liste d'utilisateurs avec un système de pagination
def get_users(db: Session, skip: int = 0, limit: int = 100):
    # .offset(skip) permet de sauter X lignes. .limit(limit) limite le nombre de retours.
    return db.query(User).offset(skip).limit(limit).all()

# Fonction permettant de créer un nouvel utilisateur dans le système
def create_user(db: Session, user: UserCreate): 
    hashed_pwd = get_password_hash(user.password) 
    db_user = User( 
        name=user.name, 
        email=user.email, 
        hashed_password=hashed_pwd,
        role=user.role if user.role is not None else "user"
    ) 
    db.add(db_user) 
    db.commit() 
    db.refresh(db_user) 
    return db_user 

# Fonction modifiant certains aspects d'une fiche utilisateur
def update_user(db: Session, user_id: int, user_update: UserUpdate): 
    # D'abord, on vérifie si l'utilisateur existe bien
    db_user = db.query(User).filter(User.id == user_id).first() 
    if not db_user: 
        # Retourne 'None' si la BDD n'a pas trouvé cet ID
        return None 
    
    # On met à jour point par point uniquement si la donnée est fournie ("is not None")
    if user_update.name is not None: 
        db_user.name = user_update.name 
    if user_update.email is not None: 
        db_user.email = user_update.email 
    # Cas très important : si un mot de passe est transmis, il FAUT impérativement le re-hacher !
    if user_update.password is not None: 
        db_user.hashed_password = get_password_hash(user_update.password) 
    # Mettre à jour le rôle (ex: transformer un `user` en `admin`)
    if user_update.role is not None: 
        db_user.role = user_update.role 
        
    # Validation pour enregistrer durablement les nouvelles valeurs BDD
    db.commit() 
    # Rafraîchir les propriétés en retour
    db.refresh(db_user) 
    # Renvoie la fiche de cet utilisateur modifiée
    return db_user 

# Fonction spécifique de suppression logique d'un utilisateur
def delete_user(db: Session, user_id: int):
    # Cherche si l'user existe
    db_user = db.query(User).filter(User.id == user_id).first()
    # Si oui, procède à la fonction de suppression
    if db_user:
        db.delete(db_user)
        # Commit = valide que l'utilisateur n'est plus en BDD
        db.commit()
    # On renvoie l'utilisateur (déjà retiré de la BDD, mais la variable existe pour un affichage temporaire)
    return db_user

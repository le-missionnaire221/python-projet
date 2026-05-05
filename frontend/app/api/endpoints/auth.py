# Importation de APIRouter (pour créer les routes), Depends (injection de dépendance) et HTTPException/status (erreurs)
from fastapi import APIRouter, Depends, HTTPException, status 
# Importation de OAuth2PasswordRequestForm pour récupérer les identifiants (username/password) envoyés par l'utilisateur
from fastapi.security import OAuth2PasswordRequestForm 
# Importation de la Session de SQLAlchemy pour interagir avec la base de données
from sqlalchemy.orm import Session 
# Importation de timedelta pour gérer la durée de validité du token
from datetime import timedelta 
# Importation de get_db pour récupérer une session de base de données
from app.core.database import get_db 
# Importation du modèle User pour faire des requêtes sur la table des utilisateurs
from app.models.user import User 
# Importation des fonctions de sécurité (vérification de mot de passe, création de token) et des paramètres
from security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES 
# Importation du schéma Token pour valider la structure de la réponse du login
from app.schemas.token import Token 

# Création du routeur spécifique pour l'authentification. L'argument 'tags' permet de grouper ces routes dans la documentation Swagger
router = APIRouter(tags=["Authentication"]) 

# Route POST '/token' qui sera utilisée pour se connecter. Elle renvoie un objet conforme au schéma 'Token'
@router.post("/token", response_model=Token) 
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)): 
    # Recherche dans la BD l'utilisateur ayant l'email (utilisé ici comme "username" dans le formulaire) correspondant
    user = db.query(User).filter(User.email == form_data.username).first() 
    # Si l'utilisateur n'existe pas, OU si le mot de passe fourni ne correspond pas au hachage stocké
    if not user or not verify_password(form_data.password, user.hashed_password): 
        # On lève une erreur HTTP 401 (Non autorisé)
        raise HTTPException( 
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password", 
            headers={"WWW-Authenticate": "Bearer"}, 
        ) 
    # Calcul du temps d'expiration du token à partir du module timedelta (en minutes)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) 
    # Création effective du token d'accès JWT, en y incluant l'email (sub) et sa date d'expiration
    access_token = create_access_token( 
        data={"sub": user.email}, expires_delta=access_token_expires 
    ) 
    # Retourne le token au format attendu (access_token et le type de token, généralement 'bearer')
    return {"access_token": access_token, "token_type": "bearer"} 

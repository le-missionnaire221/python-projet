# Importation de Depends (injection de dépendances), HTTPException (gestion d'erreurs), status (codes HTTP) depuis fastapi
from fastapi import Depends, HTTPException, status 
# Importation de la sécurité OAuth2 utilisant le standard Bearer token
from fastapi.security import OAuth2PasswordBearer 
# Importation de JWTError et jwt pour gérer les JSON Web Tokens (création/vérification)
from jose import JWTError, jwt 
# Importation de Session pour interagir avec la base de données
from sqlalchemy.orm import Session 
# Importation de la fonction get_db chargée du cycle de vie de la session (création/fermeture db)
from app.core.database import get_db 
# Importation de la fonction CRUD permettant de récupérer un user via son email
from app.crud.crud_user import get_user_by_email 
# Importation des clés secrètes et de l'algorithme de chiffrement depuis config/sécurité
from security import SECRET_KEY, ALGORITHM 

# Initialisation du schéma OAuth2 avec l'URL où le token est généré (endpoint de login '/auth/token')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token") 

# Fonction de dépendance (dependency) pour récupérer l'utilisateur actuellement connecté
# fastapi extrait automatiquement le token 'Bearer' de l'en-tête (header) de la requête HTTP
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)): 
    # Préparation d'une exception HTTP standard 401 si le token est invalide ou expiré
    credentials_exception = HTTPException( 
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Could not validate credentials", 
        headers={"WWW-Authenticate": "Bearer"}, 
    ) 
    try: 
        # Décodage du token en utilisant la clé secrète et l'algorithme (ex: HS256)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) 
        # Extraction du sujet ("sub") du token, qui correspond ici à l'email du user
        email: str = payload.get("sub") 
        # Si aucun email n'a été inclus dans le payload, le token est incomplet donc invalide
        if email is None: 
            raise credentials_exception 
    # Si le token est corrompu, expiré ou signé avec une autre clé
    except JWTError: 
        raise credentials_exception 
    
    # Appel de la base de données pour récupérer l'utilisateur correspondant à cet email
    user = get_user_by_email(db, email=email) 
    # Si aucun utilisateur n'existe avec cet email en base de données
    if user is None: 
        raise credentials_exception 
    # Retourne l'objet utilisateur, qui sera injecté dans la route qui demande 'get_current_user'
    return user 

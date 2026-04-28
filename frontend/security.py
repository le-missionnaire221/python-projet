# Module standard pour lire des variables d'environnement du système
import os
# Classes pour manipuler des dates et des deltas (écarts) de temps (ex: validité du token)
from datetime import datetime, timedelta
# Import pour typer des variables optionnelles
from typing import Optional
# Import de la fonction jwt pour encoder et décoder des JSON Web Tokens
from jose import jwt
# Import de la classe pour hacher/comparer des mots de passe
from passlib.context import CryptContext
# Module pour charger les variables depuis un fichier .env
from dotenv import load_dotenv
# FastAPI Security & Exceptions
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
# jose for JWT errors
from jose import JWTError, jwt

# Exécution de la fonction chargeant le fichier .env dans l'environnement d'exécution
load_dotenv()

# Récupération de la clé secrète, indispensable pour signer et crypter le token
SECRET_KEY = os.getenv("SECRET_KEY")
# Récupération de l'algorithme choisi pour le chiffrement (généralement HS256)
ALGORITHM = os.getenv("ALGORITHM")
# Récupération de la durée de validité du token (converti en entier via int())
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# Création d'un 'context' pour indiquer à Passlib que l'on va hacher les mots de passe avec l'algorithme bcrypt (le standard actuel)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fonction pour comparer un mot de passe en clair au moment du login avec celui haché dans la base de données
def verify_password(plain_password, hashed_password):
    # La librairie gère seule la comparaison sécurisée
    return pwd_context.verify(plain_password, hashed_password)

# Fonction pour encoder un mot de passe soumis lors de l'enregistrement de l'utilisateur
def get_password_hash(password):
    # Renvoie une longue chaine illisible correspondant au mot de passe haché
    return pwd_context.hash(password)

# Fonction générant le Token de session (JWT) une fois le mot de passe validé
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    # Fait une copie des informations à stocker (dans "data", ici l'email de l'user en tant que sujet - sub)
    to_encode = data.copy()
    # Si on a défini un temps d'expiration, on calcule la date exacte de péremption
    if expires_delta:
        # Temps universel actuel (UTC) + le temps d'expiration
        expire = datetime.utcnow() + expires_delta
    # S'il n'y en a pas fourni on donne par défaut 15 minutes de vie au token (sécurité)
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    # On ajoute au payload (to_encode) la date d'expiration via la clé standard "exp"
    to_encode.update({"exp": expire})
    # Signature et encodage du token contenant nos données
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    # Renvoie la chaîne du token à envoyer au client
    return encoded_jwt

# Configuration du schéma OAuth2 (indique à FastAPI où récupérer le token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

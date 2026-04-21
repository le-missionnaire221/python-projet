# Importation de BaseModel depuis pydantic, qui sert à créer des schémas de validation de données
from pydantic import BaseModel 
# Importation de Optional depuis typing pour définir des champs qui peuvent être None (Optionnels)
from typing import Optional 

# Définition du schéma Token : utilisé pour renvoyer la réponse lors du login (le token JWT généré)
class Token(BaseModel): 
    # La chaîne de caractères du token généré (le 'vrai' token JWT)
    access_token: str 
    # Le type du token, généralement de la valeur "bearer"
    token_type: str 

# Définition du schéma TokenData : utilisé pour typer les informations extraites *à partir* du token
class TokenData(BaseModel): 
    # L'email de l'utilisateur, qui est optionnel au moment de l'extraction (au cas où il manquerait)
    email: Optional[str] = None

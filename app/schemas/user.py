from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from enum import Enum
from app.schemas.todo import TodoResponse

class RoleEnum(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "USER"

    @field_validator('role', mode='before')
    @classmethod
    def normalize_role(cls, v):
        """Accepte 'user', 'admin', 'USER', 'ADMIN' — normalise en majuscules"""
        if v is None:
            return "USER"
        return v.upper() if isinstance(v, str) else v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: RoleEnum
    tasks: List[TodoResponse] = []

    class Config:
        from_attributes = True

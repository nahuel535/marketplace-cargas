import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole, UserStatus


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    nombre: str
    apellido: str | None
    telefono: str | None
    rol: UserRole
    status: UserStatus
    avatar_url: str | None
    email_verificado: bool
    telefono_verificado: bool
    created_at: datetime


class UserUpdateRequest(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    telefono: str | None = None

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import UserRole


class RegistroRequest(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    apellido: str | None = None
    telefono: str | None = None
    rol: UserRole

    @field_validator("password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: UserRole) -> UserRole:
        if v == UserRole.admin:
            raise ValueError("No podés registrarte como administrador")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str

    @field_validator("nueva_password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v


class VerificarEmailRequest(BaseModel):
    token: str


class MensajeResponse(BaseModel):
    mensaje: str

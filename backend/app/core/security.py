import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, hash: str) -> bool:
    return pwd_context.verify(password, hash)


def crear_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire, "type": "access"})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def crear_refresh_token() -> tuple[str, str]:
    """Devuelve (token_plano, token_hash). Guardar solo el hash en DB."""
    token = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    return token, token_hash


def hashear_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def decodificar_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def crear_token_email(user_id: str, proposito: str) -> str:
    """Token de un solo uso para verificar email o resetear password."""
    payload = {
        "sub": user_id,
        "proposito": proposito,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "email",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decodificar_token_email(token: str, proposito_esperado: str) -> str:
    """Devuelve user_id si el token es válido para el propósito dado."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "email":
            raise ValueError("Tipo de token incorrecto")
        if payload.get("proposito") != proposito_esperado:
            raise ValueError("Propósito de token incorrecto")
        return payload["sub"]
    except JWTError:
        raise ValueError("Token inválido o expirado")

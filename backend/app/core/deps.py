from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.exceptions import SinPermiso, TokenInvalido
from app.core.security import decodificar_token
from app.database import get_db
from app.models.user import User, UserRole, UserStatus

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decodificar_token(credentials.credentials)
        if payload.get("type") != "access":
            raise TokenInvalido()
        user_id: str = payload.get("sub")
        if not user_id:
            raise TokenInvalido()
    except JWTError:
        raise TokenInvalido()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise TokenInvalido()
    return user


def get_current_user_verificado(user: User = Depends(get_current_user)) -> User:
    if user.status == UserStatus.suspendido:
        raise SinPermiso("Tu cuenta está suspendida")
    return user


def get_current_transportista(user: User = Depends(get_current_user_verificado)) -> User:
    if user.rol != UserRole.transportista:
        raise SinPermiso("Solo transportistas pueden realizar esta acción")
    return user


def get_current_dador(user: User = Depends(get_current_user_verificado)) -> User:
    if user.rol != UserRole.dador:
        raise SinPermiso("Solo dadores pueden realizar esta acción")
    return user


def get_current_admin(user: User = Depends(get_current_user_verificado)) -> User:
    if user.rol != UserRole.admin:
        raise SinPermiso("Acceso restringido a administradores")
    return user

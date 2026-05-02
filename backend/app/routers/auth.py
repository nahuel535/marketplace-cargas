from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.exceptions import (
    ConflictoError,
    CredencialesInvalidas,
    NoEncontrado,
    TokenInvalido,
)
from app.core.security import (
    crear_access_token,
    crear_refresh_token,
    crear_token_email,
    decodificar_token_email,
    hashear_password,
    hashear_token,
    verificar_password,
)
from app.database import get_db
from app.models.token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MensajeResponse,
    RefreshRequest,
    RegistroRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerificarEmailRequest,
)
from app.schemas.user import UserResponse
from app.services.email_service import enviar_reset_password, enviar_verificacion_email
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MensajeResponse, status_code=201)
def register(body: RegistroRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise ConflictoError("Ya existe una cuenta con ese email")

    user = User(
        email=body.email,
        password_hash=hashear_password(body.password),
        nombre=body.nombre,
        apellido=body.apellido,
        telefono=body.telefono,
        rol=body.rol,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = crear_token_email(str(user.id), "verificar_email")
    enviar_verificacion_email(user.email, user.nombre, token)

    return {"mensaje": "Cuenta creada. Revisá tu email para verificarla."}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verificar_password(body.password, user.password_hash):
        raise CredencialesInvalidas()

    user.ultimo_login = datetime.now(timezone.utc)
    db.commit()

    access_token = crear_access_token({"sub": str(user.id), "rol": user.rol})
    token_plano, token_hash = crear_refresh_token()

    refresh = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh)
    db.commit()

    return {"access_token": access_token, "refresh_token": token_plano}


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hashear_token(body.refresh_token)
    registro = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revocado == False,
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not registro:
        raise TokenInvalido()

    # Rotar: revocar viejo y emitir nuevo
    registro.revocado = True

    user = db.query(User).filter(User.id == registro.user_id).first()
    access_token = crear_access_token({"sub": str(user.id), "rol": user.rol})
    token_plano, token_hash_nuevo = crear_refresh_token()

    nuevo_refresh = RefreshToken(
        user_id=user.id,
        token_hash=token_hash_nuevo,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(nuevo_refresh)
    db.commit()

    return {"access_token": access_token, "refresh_token": token_plano}


@router.post("/logout", response_model=MensajeResponse)
def logout(body: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hashear_token(body.refresh_token)
    registro = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if registro:
        registro.revocado = True
        db.commit()
    return {"mensaje": "Sesión cerrada correctamente"}


@router.post("/verify-email", response_model=MensajeResponse)
def verify_email(body: VerificarEmailRequest, db: Session = Depends(get_db)):
    try:
        user_id = decodificar_token_email(body.token, "verificar_email")
    except ValueError:
        raise TokenInvalido()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise TokenInvalido()

    user.email_verificado = True
    db.commit()
    return {"mensaje": "Email verificado correctamente"}


@router.post("/forgot-password", response_model=MensajeResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    # No revelar si el email existe o no
    if user:
        token = crear_token_email(str(user.id), "reset_password")
        enviar_reset_password(user.email, user.nombre, token)
    return {"mensaje": "Si el email existe, recibirás instrucciones para resetear tu contraseña"}


@router.post("/reset-password", response_model=MensajeResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        user_id = decodificar_token_email(body.token, "reset_password")
    except ValueError:
        raise TokenInvalido()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise TokenInvalido()

    user.password_hash = hashear_password(body.nueva_password)
    # Revocar todos los refresh tokens al cambiar contraseña
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({"revocado": True})
    db.commit()
    return {"mensaje": "Contraseña actualizada correctamente"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

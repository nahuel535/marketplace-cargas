import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_transportista, get_current_user_verificado
from app.core.exceptions import ConflictoError, NoEncontrado
from app.database import get_db
from app.models.profile import TransportistaProfile
from app.models.user import User
from app.schemas.perfil import TransportistaProfileRequest, TransportistaProfileResponse

router = APIRouter(prefix="/transportistas", tags=["transportistas"])


@router.post("/profile", response_model=TransportistaProfileResponse, status_code=201)
def crear_perfil(
    body: TransportistaProfileRequest,
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    if db.query(TransportistaProfile).filter(TransportistaProfile.user_id == current_user.id).first():
        raise ConflictoError("Ya tenés un perfil de transportista")

    existente = db.query(TransportistaProfile).filter(TransportistaProfile.cuit == body.cuit).first()
    if existente:
        raise ConflictoError("El CUIT ya está registrado")

    perfil = TransportistaProfile(user_id=current_user.id, **body.model_dump())
    db.add(perfil)
    db.commit()
    db.refresh(perfil)
    return perfil


@router.get("/me", response_model=TransportistaProfileResponse)
def get_mi_perfil(
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    perfil = db.query(TransportistaProfile).filter(TransportistaProfile.user_id == current_user.id).first()
    if not perfil:
        raise NoEncontrado("Perfil de transportista")
    return perfil


@router.put("/me", response_model=TransportistaProfileResponse)
def actualizar_perfil(
    body: TransportistaProfileRequest,
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    perfil = db.query(TransportistaProfile).filter(TransportistaProfile.user_id == current_user.id).first()
    if not perfil:
        raise NoEncontrado("Perfil de transportista")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(perfil, field, value)
    db.commit()
    db.refresh(perfil)
    return perfil


@router.get("/{id}", response_model=TransportistaProfileResponse)
def get_perfil_publico(id: uuid.UUID, db: Session = Depends(get_db)):
    perfil = db.query(TransportistaProfile).filter(TransportistaProfile.user_id == id).first()
    if not perfil:
        raise NoEncontrado("Transportista")
    return perfil

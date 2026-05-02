import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_dador
from app.core.exceptions import ConflictoError, NoEncontrado
from app.database import get_db
from app.models.profile import DadorProfile
from app.models.user import User
from app.schemas.perfil import DadorProfileRequest, DadorProfileResponse

router = APIRouter(prefix="/dadores", tags=["dadores"])


@router.post("/profile", response_model=DadorProfileResponse, status_code=201)
def crear_perfil(
    body: DadorProfileRequest,
    current_user: User = Depends(get_current_dador),
    db: Session = Depends(get_db),
):
    if db.query(DadorProfile).filter(DadorProfile.user_id == current_user.id).first():
        raise ConflictoError("Ya tenés un perfil de dador")

    perfil = DadorProfile(user_id=current_user.id, **body.model_dump())
    db.add(perfil)
    db.commit()
    db.refresh(perfil)
    return perfil


@router.get("/me", response_model=DadorProfileResponse)
def get_mi_perfil(current_user: User = Depends(get_current_dador), db: Session = Depends(get_db)):
    perfil = db.query(DadorProfile).filter(DadorProfile.user_id == current_user.id).first()
    if not perfil:
        raise NoEncontrado("Perfil de dador")
    return perfil


@router.put("/me", response_model=DadorProfileResponse)
def actualizar_perfil(
    body: DadorProfileRequest,
    current_user: User = Depends(get_current_dador),
    db: Session = Depends(get_db),
):
    perfil = db.query(DadorProfile).filter(DadorProfile.user_id == current_user.id).first()
    if not perfil:
        raise NoEncontrado("Perfil de dador")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(perfil, field, value)
    db.commit()
    db.refresh(perfil)
    return perfil


@router.get("/{id}", response_model=DadorProfileResponse)
def get_perfil_publico(id: uuid.UUID, db: Session = Depends(get_db)):
    perfil = db.query(DadorProfile).filter(DadorProfile.user_id == id).first()
    if not perfil:
        raise NoEncontrado("Dador")
    return perfil

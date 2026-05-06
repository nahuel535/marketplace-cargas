import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_transportista, get_current_user_verificado
from app.core.exceptions import ConflictoError, NoEncontrado
from app.database import get_db
from app.models.profile import TransportistaProfile
from app.models.user import User, UserStatus
from app.models.vehiculo import Vehiculo
from app.schemas.perfil import (
    TransportistaProfileRequest,
    TransportistaProfileResponse,
    TransportistaPublicoResponse,
)

router = APIRouter(prefix="/transportistas", tags=["transportistas"])


@router.get("/publico", response_model=list[TransportistaPublicoResponse])
def listar_transportistas_publicos(
    provincia: str | None = Query(None),
    tipo_vehiculo: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(TransportistaProfile, User)
        .join(User, User.id == TransportistaProfile.user_id)
        .filter(User.status == UserStatus.verificado)
        .options(joinedload(TransportistaProfile.user_id))
    )
    if provincia:
        query = query.filter(TransportistaProfile.provincia == provincia)

    resultados = query.limit(40).all()

    items = []
    for perfil, user in resultados:
        vehiculos = db.query(Vehiculo).filter(
            Vehiculo.transportista_id == perfil.user_id,
            Vehiculo.activo == True,
        ).all()

        if tipo_vehiculo and not any(v.tipo.value == tipo_vehiculo for v in vehiculos):
            continue

        items.append(
            TransportistaPublicoResponse(
                user_id=perfil.user_id,
                nombre=user.nombre,
                apellido=user.apellido,
                ciudad=perfil.ciudad,
                provincia=perfil.provincia,
                radio_operacion_km=perfil.radio_operacion_km,
                bio=perfil.bio,
                rating_promedio=float(perfil.rating_promedio or 0),
                cantidad_viajes=perfil.cantidad_viajes,
                vehiculos=vehiculos,
            )
        )
    return items


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

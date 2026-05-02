import uuid
from typing import List

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_transportista
from app.core.exceptions import NoEncontrado, SinPermiso
from app.database import get_db
from app.models.vehiculo import Vehiculo
from app.models.user import User
from app.schemas.vehiculo import VehiculoRequest, VehiculoResponse
from app.services.cloudinary_service import subir_archivo

router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("", response_model=VehiculoResponse, status_code=201)
def crear_vehiculo(
    body: VehiculoRequest,
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    vehiculo = Vehiculo(transportista_id=current_user.id, **body.model_dump())
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get("/me", response_model=List[VehiculoResponse])
def mis_vehiculos(
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    return db.query(Vehiculo).filter(
        Vehiculo.transportista_id == current_user.id,
        Vehiculo.activo == True,
    ).all()


@router.get("/{id}", response_model=VehiculoResponse)
def get_vehiculo(id: uuid.UUID, db: Session = Depends(get_db)):
    v = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not v:
        raise NoEncontrado("Vehículo")
    return v


@router.put("/{id}", response_model=VehiculoResponse)
def actualizar_vehiculo(
    id: uuid.UUID,
    body: VehiculoRequest,
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    v = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not v:
        raise NoEncontrado("Vehículo")
    if v.transportista_id != current_user.id:
        raise SinPermiso()
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/{id}", status_code=204)
def eliminar_vehiculo(
    id: uuid.UUID,
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    v = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not v:
        raise NoEncontrado("Vehículo")
    if v.transportista_id != current_user.id:
        raise SinPermiso()
    v.activo = False
    db.commit()


@router.post("/{id}/fotos", response_model=VehiculoResponse)
def subir_foto(
    id: uuid.UUID,
    foto: UploadFile = File(...),
    current_user: User = Depends(get_current_transportista),
    db: Session = Depends(get_db),
):
    v = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not v:
        raise NoEncontrado("Vehículo")
    if v.transportista_id != current_user.id:
        raise SinPermiso()

    contenido = foto.file.read()
    url = subir_archivo(contenido, f"vehiculo_{id}_principal", "vehiculo_foto")
    v.foto_principal_url = url
    db.commit()
    db.refresh(v)
    return v

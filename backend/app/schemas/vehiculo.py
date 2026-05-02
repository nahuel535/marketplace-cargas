import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.vehiculo import VehiculoTipo


class VehiculoRequest(BaseModel):
    tipo: VehiculoTipo
    patente: str
    marca: str | None = None
    modelo: str | None = None
    anio: int | None = None
    capacidad_kg: int
    capacidad_m3: float | None = None
    refrigerado: bool = False
    tiene_hidrogrua: bool = False
    features: dict = {}


class VehiculoResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    transportista_id: uuid.UUID
    tipo: VehiculoTipo
    patente: str
    marca: str | None
    modelo: str | None
    anio: int | None
    capacidad_kg: int
    capacidad_m3: float | None
    refrigerado: bool
    tiene_hidrogrua: bool
    features: dict
    foto_principal_url: str | None
    verificado: bool
    activo: bool
    created_at: datetime


class DocumentoResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    tipo: str
    archivo_url: str
    vencimiento: str | None
    estado: str
    motivo_rechazo: str | None
    created_at: datetime

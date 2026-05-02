import uuid
from datetime import datetime, date

from pydantic import BaseModel

from app.models.profile import PersonaTipo


class TransportistaProfileRequest(BaseModel):
    cuit: str
    razon_social: str | None = None
    tipo: PersonaTipo
    domicilio: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    ruta_numero: str | None = None
    ruta_vencimiento: date | None = None
    radio_operacion_km: int = 500
    bio: str | None = None


class TransportistaProfileResponse(BaseModel):
    model_config = {"from_attributes": True}

    user_id: uuid.UUID
    cuit: str
    razon_social: str | None
    tipo: PersonaTipo
    ciudad: str | None
    provincia: str | None
    radio_operacion_km: int
    bio: str | None
    rating_promedio: float
    cantidad_viajes: int
    suscripcion_activa: bool
    suscripcion_vence_at: datetime | None
    created_at: datetime


class DadorProfileRequest(BaseModel):
    cuit_dni: str
    razon_social: str | None = None
    tipo: PersonaTipo
    sector: str | None = None
    ciudad: str | None = None
    provincia: str | None = None


class DadorProfileResponse(BaseModel):
    model_config = {"from_attributes": True}

    user_id: uuid.UUID
    cuit_dni: str
    razon_social: str | None
    tipo: PersonaTipo
    sector: str | None
    ciudad: str | None
    provincia: str | None
    rating_promedio: float
    cantidad_publicaciones: int
    created_at: datetime

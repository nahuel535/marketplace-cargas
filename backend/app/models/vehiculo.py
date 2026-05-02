import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class VehiculoTipo(str, enum.Enum):
    utilitario = "utilitario"
    furgon = "furgon"
    camion_chico = "camion_chico"
    camion_grande = "camion_grande"
    semi = "semi"
    tractor = "tractor"
    batea = "batea"
    tolva = "tolva"
    cisterna = "cisterna"
    porta_contenedor = "porta_contenedor"
    otro = "otro"


class Vehiculo(Base):
    __tablename__ = "vehiculos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transportista_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tipo: Mapped[VehiculoTipo] = mapped_column(Enum(VehiculoTipo), nullable=False)
    patente: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    marca: Mapped[str | None] = mapped_column(String(50))
    modelo: Mapped[str | None] = mapped_column(String(50))
    anio: Mapped[int | None] = mapped_column(Integer)
    capacidad_kg: Mapped[int] = mapped_column(Integer, nullable=False)
    capacidad_m3: Mapped[float | None] = mapped_column(Numeric(8, 2))
    refrigerado: Mapped[bool] = mapped_column(Boolean, default=False)
    tiene_hidrogrua: Mapped[bool] = mapped_column(Boolean, default=False)
    features: Mapped[dict] = mapped_column(JSONB, default=dict)
    foto_principal_url: Mapped[str | None] = mapped_column(Text)
    fotos_adicionales: Mapped[list] = mapped_column(JSONB, default=list)
    verificado: Mapped[bool] = mapped_column(Boolean, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    transportista = relationship("User", foreign_keys=[transportista_id])
    documentos = relationship("Documento", back_populates="vehiculo", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_vehiculos_transp", "transportista_id"),)

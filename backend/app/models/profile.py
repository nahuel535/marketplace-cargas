import uuid
from datetime import datetime, date

from sqlalchemy import Boolean, Date, DateTime, Numeric, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class PersonaTipo(str, enum.Enum):
    particular = "particular"
    monotributista = "monotributista"
    responsable_inscripto = "responsable_inscripto"
    empresa = "empresa"


class TransportistaProfile(Base):
    __tablename__ = "transportistas_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    cuit: Mapped[str] = mapped_column(String(13), unique=True, nullable=False)
    razon_social: Mapped[str | None] = mapped_column(String(200))
    tipo: Mapped[PersonaTipo] = mapped_column(Enum(PersonaTipo), nullable=False)
    domicilio: Mapped[str | None] = mapped_column(Text)
    ciudad: Mapped[str | None] = mapped_column(String(100))
    provincia: Mapped[str | None] = mapped_column(String(100))
    ruta_numero: Mapped[str | None] = mapped_column(String(50))
    ruta_vencimiento: Mapped[date | None] = mapped_column(Date)
    radio_operacion_km: Mapped[int] = mapped_column(Integer, default=500)
    bio: Mapped[str | None] = mapped_column(Text)
    rating_promedio: Mapped[float] = mapped_column(Numeric(3, 2), default=0)
    cantidad_viajes: Mapped[int] = mapped_column(Integer, default=0)
    suscripcion_activa: Mapped[bool] = mapped_column(Boolean, default=False)
    suscripcion_vence_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="transportista_profile")

    __table_args__ = (
        Index("idx_transp_provincia", "provincia"),
        Index("idx_transp_suscripcion", "suscripcion_activa", "suscripcion_vence_at"),
    )


class DadorProfile(Base):
    __tablename__ = "dadores_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    cuit_dni: Mapped[str] = mapped_column(String(13), nullable=False)
    razon_social: Mapped[str | None] = mapped_column(String(200))
    tipo: Mapped[PersonaTipo] = mapped_column(Enum(PersonaTipo), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(100))
    ciudad: Mapped[str | None] = mapped_column(String(100))
    provincia: Mapped[str | None] = mapped_column(String(100))
    cantidad_publicaciones: Mapped[int] = mapped_column(Integer, default=0)
    rating_promedio: Mapped[float] = mapped_column(Numeric(3, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="dador_profile")

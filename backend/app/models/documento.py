import uuid
from datetime import datetime, date

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class DocumentoTipo(str, enum.Enum):
    dni = "dni"
    cuit = "cuit"
    ruta = "ruta"
    poliza_seguro = "poliza_seguro"
    vtv = "vtv"
    cedula_verde = "cedula_verde"
    cedula_azul = "cedula_azul"
    licencia_conducir = "licencia_conducir"
    libreta_sanitaria = "libreta_sanitaria"
    monotributo = "monotributo"
    otro = "otro"


class DocumentoEstado(str, enum.Enum):
    pendiente = "pendiente"
    aprobado = "aprobado"
    rechazado = "rechazado"
    vencido = "vencido"


class Documento(Base):
    __tablename__ = "documentos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    vehiculo_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehiculos.id", ondelete="CASCADE")
    )
    tipo: Mapped[DocumentoTipo] = mapped_column(Enum(DocumentoTipo), nullable=False)
    archivo_url: Mapped[str] = mapped_column(Text, nullable=False)
    vencimiento: Mapped[date | None] = mapped_column(Date)
    estado: Mapped[DocumentoEstado] = mapped_column(
        Enum(DocumentoEstado), default=DocumentoEstado.pendiente
    )
    motivo_rechazo: Mapped[str | None] = mapped_column(Text)
    verificado_por: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    verificado_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    vehiculo = relationship("Vehiculo", back_populates="documentos")
    verificador = relationship("User", foreign_keys=[verificado_por])

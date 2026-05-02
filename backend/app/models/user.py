import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class UserRole(str, enum.Enum):
    dador = "dador"
    transportista = "transportista"
    admin = "admin"


class UserStatus(str, enum.Enum):
    pendiente_verificacion = "pendiente_verificacion"
    verificado = "verificado"
    suspendido = "suspendido"
    rechazado = "rechazado"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(30))
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str | None] = mapped_column(String(100))
    rol: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), nullable=False, default=UserStatus.pendiente_verificacion
    )
    avatar_url: Mapped[str | None] = mapped_column(String)
    email_verificado: Mapped[bool] = mapped_column(Boolean, default=False)
    telefono_verificado: Mapped[bool] = mapped_column(Boolean, default=False)
    ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    transportista_profile = relationship(
        "TransportistaProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    dador_profile = relationship(
        "DadorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_rol_status", "rol", "status"),
    )

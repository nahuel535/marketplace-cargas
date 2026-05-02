import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.core.exceptions import NoEncontrado
from app.database import get_db
from app.models.documento import Documento, DocumentoEstado
from app.models.user import User, UserStatus
from app.schemas.user import UserResponse
from app.schemas.vehiculo import DocumentoResponse

router = APIRouter(prefix="/admin", tags=["admin"])


class AccionUsuario(BaseModel):
    motivo: str | None = None


class AccionDocumento(BaseModel):
    motivo_rechazo: str | None = None


@router.get("/users", response_model=List[UserResponse])
def listar_usuarios(
    rol: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    q = db.query(User)
    if rol:
        q = q.filter(User.rol == rol)
    if status:
        q = q.filter(User.status == status)
    return q.order_by(User.created_at.desc()).limit(100).all()


@router.post("/users/{id}/verificar", response_model=UserResponse)
def verificar_usuario(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise NoEncontrado("Usuario")
    user.status = UserStatus.verificado
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{id}/suspender", response_model=UserResponse)
def suspender_usuario(
    id: uuid.UUID,
    body: AccionUsuario,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise NoEncontrado("Usuario")
    user.status = UserStatus.suspendido
    db.commit()
    db.refresh(user)
    return user


@router.get("/documentos", response_model=List[DocumentoResponse])
def listar_documentos(
    estado: str = "pendiente",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return (
        db.query(Documento)
        .filter(Documento.estado == estado)
        .order_by(Documento.created_at.asc())
        .limit(100)
        .all()
    )


@router.post("/documentos/{id}/aprobar", response_model=DocumentoResponse)
def aprobar_documento(
    id: uuid.UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    doc = db.query(Documento).filter(Documento.id == id).first()
    if not doc:
        raise NoEncontrado("Documento")
    doc.estado = DocumentoEstado.aprobado
    doc.verificado_por = admin.id
    doc.verificado_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return doc


@router.post("/documentos/{id}/rechazar", response_model=DocumentoResponse)
def rechazar_documento(
    id: uuid.UUID,
    body: AccionDocumento,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    doc = db.query(Documento).filter(Documento.id == id).first()
    if not doc:
        raise NoEncontrado("Documento")
    doc.estado = DocumentoEstado.rechazado
    doc.motivo_rechazo = body.motivo_rechazo
    doc.verificado_por = admin.id
    doc.verificado_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    from app.models.documento import Documento
    return {
        "usuarios_total": db.query(User).count(),
        "usuarios_pendientes": db.query(User).filter(User.status == UserStatus.pendiente_verificacion).count(),
        "documentos_pendientes": db.query(Documento).filter(Documento.estado == DocumentoEstado.pendiente).count(),
    }

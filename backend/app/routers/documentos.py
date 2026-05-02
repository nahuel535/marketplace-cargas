import uuid
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_verificado
from app.core.exceptions import NoEncontrado, SinPermiso
from app.database import get_db
from app.models.documento import Documento, DocumentoTipo
from app.models.user import User
from app.schemas.vehiculo import DocumentoResponse
from app.services.cloudinary_service import subir_archivo

router = APIRouter(prefix="/documentos", tags=["documentos"])


@router.post("", response_model=DocumentoResponse, status_code=201)
def subir_documento(
    tipo: DocumentoTipo = Form(...),
    vencimiento: str | None = Form(None),
    vehiculo_id: uuid.UUID | None = Form(None),
    archivo: UploadFile = File(...),
    current_user: User = Depends(get_current_user_verificado),
    db: Session = Depends(get_db),
):
    contenido = archivo.file.read()
    nombre = f"doc_{current_user.id}_{tipo.value}_{uuid.uuid4().hex[:8]}"
    url = subir_archivo(contenido, nombre, "documento")

    doc = Documento(
        user_id=current_user.id if not vehiculo_id else None,
        vehiculo_id=vehiculo_id,
        tipo=tipo,
        archivo_url=url,
        vencimiento=vencimiento,
    )
    if vehiculo_id:
        doc.user_id = current_user.id

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/me", response_model=List[DocumentoResponse])
def mis_documentos(
    current_user: User = Depends(get_current_user_verificado),
    db: Session = Depends(get_db),
):
    return db.query(Documento).filter(Documento.user_id == current_user.id).all()


@router.delete("/{id}", status_code=204)
def eliminar_documento(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user_verificado),
    db: Session = Depends(get_db),
):
    doc = db.query(Documento).filter(Documento.id == id).first()
    if not doc:
        raise NoEncontrado("Documento")
    if doc.user_id != current_user.id:
        raise SinPermiso()
    db.delete(doc)
    db.commit()

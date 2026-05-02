import cloudinary
import cloudinary.uploader

from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

CARPETAS = {
    "avatar": "marketplace/avatares",
    "vehiculo_foto": "marketplace/vehiculos",
    "documento": "marketplace/documentos",
    "comprobante": "marketplace/comprobantes",
}


def subir_archivo(contenido: bytes, nombre: str, carpeta_key: str) -> str:
    """Sube un archivo a Cloudinary y devuelve la URL segura."""
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise ValueError("Cloudinary no está configurado")

    carpeta = CARPETAS.get(carpeta_key, "marketplace/general")
    resultado = cloudinary.uploader.upload(
        contenido,
        folder=carpeta,
        public_id=nombre,
        overwrite=True,
        resource_type="auto",
    )
    return resultado["secure_url"]


def eliminar_archivo(url: str) -> None:
    """Elimina un archivo de Cloudinary por URL (best-effort)."""
    if not settings.CLOUDINARY_CLOUD_NAME or not url:
        return
    try:
        public_id = url.split("/upload/")[-1].rsplit(".", 1)[0]
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass

import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import auth, users, transportistas, dadores, vehiculos, documentos, admin

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Marketplace de Cargas API",
    version="0.1.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
)

_origins = {"http://localhost:5173", settings.FRONTEND_URL}
if settings.CORS_ORIGINS:
    _origins.update(o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_origins),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(transportistas.router, prefix="/api/v1")
app.include_router(dadores.router, prefix="/api/v1")
app.include_router(vehiculos.router, prefix="/api/v1")
app.include_router(documentos.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Error no manejado: %s\n%s", exc, traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"})


@app.get("/health")
def health():
    return {"status": "ok"}

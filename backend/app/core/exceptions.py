from fastapi import HTTPException, status


class CredencialesInvalidas(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )


class TokenInvalido(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


class SinPermiso(HTTPException):
    def __init__(self, detalle: str = "No tenés permiso para realizar esta acción"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detalle)


class NoEncontrado(HTTPException):
    def __init__(self, recurso: str = "Recurso"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{recurso} no encontrado",
        )


class ConflictoError(HTTPException):
    def __init__(self, detalle: str):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detalle)


class ErrorValidacion(HTTPException):
    def __init__(self, detalle: str):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detalle)

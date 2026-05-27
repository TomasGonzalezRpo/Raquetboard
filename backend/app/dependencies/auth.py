"""Dependencia de autenticación para proteger rutas de FastAPI."""
from fastapi import Cookie, HTTPException, status
from jose import JWTError

from app.config import get_settings
from app.services.auth import decode_jwt


def get_current_user(session: str | None = Cookie(default=None)) -> dict:
    """
    Verifica el JWT de sesión y devuelve los datos del usuario.
    Lanza 401 si el token es inválido o ha expirado.
    """
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    try:
        payload = decode_jwt(session)
        email: str = payload.get("sub", "")

        # Solo el email permitido puede acceder
        if email != get_settings().allowed_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso no autorizado",
            )

        return {"email": email, "name": payload.get("name", ""), "picture": payload.get("picture", "")}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida o expirada",
        )

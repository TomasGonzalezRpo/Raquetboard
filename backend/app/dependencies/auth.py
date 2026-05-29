from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError, jwt
from typing import Optional

from app.config import settings
from app.models.schemas import UserInfo


def get_current_user(access_token: Optional[str] = Cookie(None)) -> UserInfo:
    """Verifica el JWT de la cookie y retorna el usuario autenticado."""
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    try:
        payload = jwt.decode(
            access_token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        email: str = payload.get("sub")
        name: str = payload.get("name", "")
        picture: str = payload.get("picture", "")
        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")
        return UserInfo(email=email, name=name, picture=picture)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

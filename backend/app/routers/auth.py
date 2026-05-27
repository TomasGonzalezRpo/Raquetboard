"""Router de autenticación con Google OAuth."""
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse

from app.config import get_settings
from app.dependencies.auth import get_current_user
from app.services.auth import (
    create_jwt,
    exchange_code,
    get_authorization_url,
    get_google_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
def login():
    """Redirige al usuario al flujo de consentimiento de Google."""
    return RedirectResponse(get_authorization_url())


@router.get("/callback")
async def callback(code: str, response: Response):
    """
    Recibe el código de Google, obtiene la info del usuario,
    verifica que sea el email permitido y crea la cookie de sesión.
    """
    settings = get_settings()

    tokens = await exchange_code(code)
    user_info = await get_google_user(tokens["access_token"])

    email = user_info.get("email", "")
    if email != settings.allowed_email:
        raise HTTPException(status_code=403, detail="Acceso no autorizado")

    token = create_jwt(
        email=email,
        name=user_info.get("name", ""),
        picture=user_info.get("picture", ""),
    )

    redirect = RedirectResponse(url=settings.frontend_url)
    redirect.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )
    return redirect


@router.post("/logout")
def logout(response: Response, _user=Depends(get_current_user)):
    """Elimina la cookie de sesión."""
    response.delete_cookie("session")
    return {"ok": True}


@router.get("/me")
def me(user=Depends(get_current_user)):
    """Devuelve los datos del usuario autenticado."""
    return user

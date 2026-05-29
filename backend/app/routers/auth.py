from fastapi import APIRouter, HTTPException, Response, Depends
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from jose import jwt
import httpx

from app.config import settings
from app.dependencies.auth import get_current_user
from app.models.schemas import UserInfo

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def create_jwt(email: str, name: str, picture: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.jwt_expire_days)
    payload = {
        "sub": email,
        "name": name,
        "picture": picture,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.get("/login")
def login():
    """Redirige al usuario a la pantalla de login de Google."""
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/callback")
async def callback(code: str, response: Response):
    """Intercambia el code de Google por un JWT propio."""
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Error al obtener tokens de Google")

        tokens = token_resp.json()
        user_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        user = user_resp.json()

    email = user.get("email", "")
    if email != settings.allowed_email:
        raise HTTPException(status_code=403, detail="Acceso no autorizado")

    token = create_jwt(email, user.get("name", ""), user.get("picture", ""))

    redirect = RedirectResponse(url=settings.frontend_url)
    redirect.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=settings.jwt_expire_days * 24 * 3600,
    )
    return redirect


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserInfo)
def me(user: UserInfo = Depends(get_current_user)):
    return user

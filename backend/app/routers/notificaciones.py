from fastapi import APIRouter, HTTPException, Depends
from pywebpush import webpush, WebPushException
import json

from app.dependencies.auth import get_current_user
from app.models.schemas import PushSubscription, PushMessage, UserInfo
from app.services.db import get_db
from app.config import settings

router = APIRouter(prefix="/notificaciones", tags=["notificaciones"])


@router.post("/suscribir", status_code=201)
def suscribir_dispositivo(sub: PushSubscription, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    existing = db.table("push_subscriptions").select("id").eq("endpoint", sub.endpoint).execute().data
    if existing:
        return {"message": "Ya suscrito"}
    db.table("push_subscriptions").insert({
        "endpoint": sub.endpoint,
        "p256dh": sub.keys.get("p256dh", ""),
        "auth": sub.keys.get("auth", ""),
    }).execute()
    return {"message": "Suscripción guardada"}


@router.post("/enviar")
def enviar_push(msg: PushMessage, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    subs = db.table("push_subscriptions").select("*").execute().data
    if not subs:
        raise HTTPException(status_code=404, detail="No hay dispositivos suscritos")

    payload = json.dumps({"title": msg.title, "body": msg.body, "url": msg.url or "/"})
    enviados = 0
    for s in subs:
        try:
            webpush(
                subscription_info={"endpoint": s["endpoint"], "keys": {"p256dh": s["p256dh"], "auth": s["auth"]}},
                data=payload,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": f"mailto:{settings.vapid_claims_email}"},
            )
            enviados += 1
        except WebPushException:
            pass
    return {"enviados": enviados}

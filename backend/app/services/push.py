"""Servicio de notificaciones push usando pywebpush."""
import json

from pywebpush import webpush, WebPushException

from app.config import get_settings
from app.services import sheets


def send_push(subscription: dict, title: str, body: str, url: str = "/") -> bool:
    """Envía una notificación push a un dispositivo suscrito."""
    settings = get_settings()
    payload = json.dumps({"title": title, "body": body, "url": url})
    try:
        webpush(
            subscription_info=subscription,
            data=payload,
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": f"mailto:{settings.vapid_claims_email}"},
        )
        return True
    except WebPushException as e:
        # Suscripción expirada o inválida
        if e.response and e.response.status_code in (404, 410):
            _remove_subscription(subscription.get("endpoint", ""))
        return False


def send_push_to_all(title: str, body: str, url: str = "/") -> dict:
    """Envía una notificación a todos los dispositivos suscritos."""
    subs = sheets.read_sheet(sheets.SHEETS["push_subs"])
    ok, fail = 0, 0
    for row in subs:
        try:
            sub = json.loads(row.get("subscription_json", "{}"))
            if send_push(sub, title, body, url):
                ok += 1
            else:
                fail += 1
        except (json.JSONDecodeError, Exception):
            fail += 1
    return {"enviadas": ok, "fallidas": fail}


def _remove_subscription(endpoint: str) -> None:
    """Elimina una suscripción expirada (no la borra, la marca inactiva)."""
    subs = sheets.read_sheet(sheets.SHEETS["push_subs"])
    for i, row in enumerate(subs):
        sub = json.loads(row.get("subscription_json", "{}"))
        if sub.get("endpoint") == endpoint:
            updated = {**row, "activo": "FALSE"}
            headers = list(updated.keys())
            sheets.update_row(sheets.SHEETS["push_subs"], i + 2, headers, updated)
            break

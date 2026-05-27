"""Router de notificaciones push."""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.schemas import PushMensaje, PushSuscripcion
from app.services import push, sheets

router = APIRouter(prefix="/notificaciones", tags=["notificaciones"])

SHEET = sheets.SHEETS["push_subs"]
HEADERS = ["sub_id", "endpoint", "subscription_json", "fecha_registro", "activo"]


@router.post("/suscribir", status_code=201)
def suscribir(data: PushSuscripcion, _user=Depends(get_current_user)):
    """Registra o actualiza la suscripción push del dispositivo."""
    sub_json = json.dumps({"endpoint": data.endpoint, "keys": data.keys})

    # Verificar si ya existe
    subs = sheets.read_sheet(SHEET)
    for i, row in enumerate(subs):
        if row.get("endpoint") == data.endpoint:
            updated = {**row, "subscription_json": sub_json, "activo": "TRUE"}
            sheets.update_row(SHEET, i + 2, HEADERS, updated)
            return {"ok": True, "action": "updated"}

    # Nueva suscripción
    sub_id = sheets.next_id(SHEET, "SUB")
    new_row = {
        "sub_id": sub_id,
        "endpoint": data.endpoint,
        "subscription_json": sub_json,
        "fecha_registro": datetime.now(timezone.utc).isoformat(),
        "activo": "TRUE",
    }
    sheets.append_row(SHEET, HEADERS, new_row)
    return {"ok": True, "action": "created"}


@router.post("/enviar")
def enviar(data: PushMensaje, _user=Depends(get_current_user)):
    """Envía una notificación push a todos los dispositivos suscritos."""
    result = push.send_push_to_all(
        title=data.titulo,
        body=data.mensaje,
        url=data.url or "/",
    )
    return result

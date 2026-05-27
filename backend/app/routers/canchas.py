"""Router de canchas."""
from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import CanchaCreate
from app.services import sheets

router = APIRouter(prefix="/canchas", tags=["canchas"])

SHEET = sheets.SHEETS["canchas"]
HEADERS = ["cancha_id", "nombre", "ubicacion", "superficie", "activo"]


@router.get("/")
def listar(_user=Depends(get_current_user)):
    rows = sheets.read_sheet(SHEET)
    return [r for r in rows if r.get("activo", "TRUE") == "TRUE"]


@router.post("/", status_code=201)
def crear(data: CanchaCreate, _user=Depends(get_current_user)):
    cancha_id = sheets.next_id(SHEET, "CAN")
    new_row = {
        "cancha_id": cancha_id,
        "nombre": data.nombre,
        "ubicacion": data.ubicacion,
        "superficie": data.superficie or "",
        "activo": "TRUE",
    }
    sheets.append_row(SHEET, HEADERS, new_row)
    return new_row


@router.patch("/{cancha_id}")
def actualizar(cancha_id: str, activo: bool, _user=Depends(get_current_user)):
    row, row_num = sheets.find_row(SHEET, "cancha_id", cancha_id)
    if not row:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    updated = {**row, "activo": "TRUE" if activo else "FALSE"}
    sheets.update_row(SHEET, row_num, HEADERS, updated)
    return updated

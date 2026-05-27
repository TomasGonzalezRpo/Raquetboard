"""Router de paquetes."""
from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import PaqueteCreate, PaqueteUpdate
from app.services import sheets

router = APIRouter(prefix="/paquetes", tags=["paquetes"])

SHEET = sheets.SHEETS["paquetes"]
HEADERS = ["paquete_id", "nombre", "num_clases", "precio", "vigencia_dias", "activo"]


@router.get("/")
def listar(_user=Depends(get_current_user)):
    rows = sheets.read_sheet(SHEET)
    return [r for r in rows if r.get("activo", "TRUE") == "TRUE"]


@router.post("/", status_code=201)
def crear(data: PaqueteCreate, _user=Depends(get_current_user)):
    paquete_id = sheets.next_id(SHEET, "PKG")
    new_row = {
        "paquete_id": paquete_id,
        "nombre": data.nombre,
        "num_clases": str(data.num_clases),
        "precio": str(data.precio),
        "vigencia_dias": str(data.vigencia_dias),
        "activo": "TRUE",
    }
    sheets.append_row(SHEET, HEADERS, new_row)
    return new_row


@router.patch("/{paquete_id}")
def actualizar(paquete_id: str, data: PaqueteUpdate, _user=Depends(get_current_user)):
    row, row_num = sheets.find_row(SHEET, "paquete_id", paquete_id)
    if not row:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")

    updates = data.model_dump(exclude_none=True)
    if "activo" in updates:
        updates["activo"] = "TRUE" if updates["activo"] else "FALSE"

    updated = {**row, **updates}
    sheets.update_row(SHEET, row_num, HEADERS, updated)
    return updated

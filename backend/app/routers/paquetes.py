from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Paquete, PaqueteCreate, PaqueteUpdate, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/paquetes", tags=["paquetes"])


def _add_costo(row: dict) -> dict:
    n = row.get("num_clases") or 1
    row["costo_por_clase"] = round(float(row.get("precio", 0)) / n, 2)
    return row


@router.get("/", response_model=list[Paquete])
def listar_paquetes(activo: Optional[bool] = None, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    q = db.table("paquetes").select("*")
    if activo is not None:
        q = q.eq("activo", activo)
    rows = q.order("nombre").execute().data
    return [_add_costo(r) for r in rows]


@router.post("/", response_model=Paquete, status_code=201)
def crear_paquete(data: PaqueteCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    paquete_id = next_id("paquetes", "paquete_id", "PKG")
    row = {"paquete_id": paquete_id, **data.model_dump(), "activo": True}
    result = db.table("paquetes").insert(row).execute()
    return _add_costo(result.data[0])


@router.patch("/{paquete_id}", response_model=Paquete)
def editar_paquete(paquete_id: str, data: PaqueteUpdate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")
    rows = db.table("paquetes").update(updates).eq("paquete_id", paquete_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return _add_costo(rows[0])

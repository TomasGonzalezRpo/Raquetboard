from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Cancha, CanchaCreate, CanchaUpdate, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/canchas", tags=["canchas"])


@router.get("/", response_model=list[Cancha])
def listar_canchas(activa: Optional[bool] = None, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    q = db.table("canchas").select("*")
    if activa is not None:
        q = q.eq("activa", activa)
    return q.order("nombre").execute().data


@router.post("/", response_model=Cancha, status_code=201)
def crear_cancha(data: CanchaCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    cancha_id = next_id("canchas", "cancha_id", "CAN")
    row = {"cancha_id": cancha_id, **data.model_dump(), "activa": True}
    return db.table("canchas").insert(row).execute().data[0]


@router.patch("/{cancha_id}", response_model=Cancha)
def editar_cancha(cancha_id: str, data: CanchaUpdate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")
    rows = db.table("canchas").update(updates).eq("cancha_id", cancha_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return rows[0]

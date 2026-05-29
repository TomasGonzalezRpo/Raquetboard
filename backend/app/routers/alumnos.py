from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Alumno, AlumnoCreate, AlumnoUpdate, Clase, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/alumnos", tags=["alumnos"])


def _enrich_clases_restantes(alumnos: list[dict]) -> list[dict]:
    """Agrega clases_restantes desde inscripciones activas."""
    if not alumnos:
        return alumnos
    db = get_db()
    ids = [a["alumno_id"] for a in alumnos]
    ins = db.table("inscripciones").select("alumno_id, clases_usadas, clases_total") \
           .in_("alumno_id", ids).eq("estado", "activa").execute().data
    mapa: dict[str, int] = {}
    for i in ins:
        restantes = max(0, i["clases_total"] - i["clases_usadas"])
        mapa[i["alumno_id"]] = mapa.get(i["alumno_id"], 0) + restantes
    for a in alumnos:
        a["clases_restantes"] = mapa.get(a["alumno_id"])
    return alumnos


@router.get("/", response_model=list[Alumno])
def listar_alumnos(
    activo: Optional[bool] = None,
    q: Optional[str] = None,
    _: UserInfo = Depends(get_current_user),
):
    db = get_db()
    query = db.table("alumnos").select("*")
    if activo is not None:
        query = query.eq("activo", activo)
    if q:
        query = query.ilike("nombre", f"%{q}%")
    rows = query.order("nombre").execute().data
    return _enrich_clases_restantes(rows)


@router.get("/{alumno_id}", response_model=Alumno)
def obtener_alumno(alumno_id: str, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    rows = db.table("alumnos").select("*").eq("alumno_id", alumno_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return _enrich_clases_restantes(rows)[0]


@router.post("/", response_model=Alumno, status_code=201)
def crear_alumno(data: AlumnoCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    alumno_id = next_id("alumnos", "alumno_id", "ALU")
    row = {"alumno_id": alumno_id, "nombre": data.nombre,
           "telefono": data.telefono, "activo": True, "notas": data.notas}
    result = db.table("alumnos").insert(row).execute()
    return result.data[0]


@router.patch("/{alumno_id}", response_model=Alumno)
def editar_alumno(alumno_id: str, data: AlumnoUpdate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")
    rows = db.table("alumnos").update(updates).eq("alumno_id", alumno_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return _enrich_clases_restantes(rows)[0]


@router.get("/{alumno_id}/historial", response_model=list[Clase])
def historial_alumno(alumno_id: str, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    if not db.table("alumnos").select("alumno_id").eq("alumno_id", alumno_id).execute().data:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    rows = db.table("clases").select("*").eq("alumno_id", alumno_id) \
             .order("fecha", desc=True).execute().data
    return rows

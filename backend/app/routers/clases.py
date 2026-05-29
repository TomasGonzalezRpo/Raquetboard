from fastapi import APIRouter, HTTPException, Depends
from datetime import date
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Clase, ClaseCreate, ClaseUpdate, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/clases", tags=["clases"])


@router.get("/hoy", response_model=list[Clase])
def clases_hoy(_: UserInfo = Depends(get_current_user)):
    db = get_db()
    rows = db.table("clases").select("*, alumnos(nombre)") \
             .eq("fecha", str(date.today())).order("created_at").execute().data
    for r in rows:
        r["alumno_nombre"] = r.pop("alumnos", {}).get("nombre") if isinstance(r.get("alumnos"), dict) else None
    return rows


@router.get("/", response_model=list[Clase])
def listar_clases(
    alumno_id: Optional[str] = None,
    inscripcion_id: Optional[str] = None,
    _: UserInfo = Depends(get_current_user),
):
    db = get_db()
    q = db.table("clases").select("*, alumnos(nombre)")
    if alumno_id:
        q = q.eq("alumno_id", alumno_id)
    if inscripcion_id:
        q = q.eq("inscripcion_id", inscripcion_id)
    rows = q.order("fecha", desc=True).execute().data
    for r in rows:
        r["alumno_nombre"] = r.pop("alumnos", {}).get("nombre") if isinstance(r.get("alumnos"), dict) else None
    return rows


@router.post("/", response_model=Clase, status_code=201)
def registrar_clase(data: ClaseCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    # Verificar inscripción
    ins_rows = db.table("inscripciones").select("*").eq("inscripcion_id", data.inscripcion_id).execute().data
    if not ins_rows:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    ins = ins_rows[0]

    clase_id = next_id("clases", "clase_id", "CLS")
    row = {
        "clase_id": clase_id,
        "alumno_id": data.alumno_id,
        "inscripcion_id": data.inscripcion_id,
        "fecha": str(data.fecha),
        "estado": data.estado,
        "apuntes": data.apuntes,
    }
    result = db.table("clases").insert(row).execute()

    # Incrementar clases_usadas si fue dada
    if data.estado == "dada":
        nuevas_usadas = ins["clases_usadas"] + 1
        restantes = ins["clases_total"] - nuevas_usadas
        nuevo_estado = "completada" if restantes <= 0 else "activa"
        db.table("inscripciones").update({
            "clases_usadas": nuevas_usadas,
            "estado": nuevo_estado,
        }).eq("inscripcion_id", data.inscripcion_id).execute()

    clase = result.data[0]
    alu = db.table("alumnos").select("nombre").eq("alumno_id", data.alumno_id).execute().data
    clase["alumno_nombre"] = alu[0]["nombre"] if alu else None
    return clase


@router.patch("/{clase_id}", response_model=Clase)
def editar_clase(clase_id: str, data: ClaseUpdate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")
    rows = db.table("clases").update(updates).eq("clase_id", clase_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Clase no encontrada")
    return rows[0]

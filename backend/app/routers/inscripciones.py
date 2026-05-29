from fastapi import APIRouter, HTTPException, Depends
from datetime import date, timedelta
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Inscripcion, InscripcionCreate, InscripcionExtender, InscripcionResumen, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/inscripciones", tags=["inscripciones"])


def _to_inscripcion(row: dict) -> dict:
    row["clases_restantes"] = max(0, row["clases_total"] - row["clases_usadas"])
    return row


@router.get("/", response_model=list[Inscripcion])
def listar_inscripciones(
    alumno_id: Optional[str] = None,
    estado: Optional[str] = None,
    _: UserInfo = Depends(get_current_user),
):
    db = get_db()
    q = db.table("inscripciones").select("*")
    if alumno_id:
        q = q.eq("alumno_id", alumno_id)
    if estado:
        q = q.eq("estado", estado)
    rows = q.order("created_at", desc=True).execute().data
    return [_to_inscripcion(r) for r in rows]


@router.post("/", response_model=Inscripcion, status_code=201)
def crear_inscripcion(data: InscripcionCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    pkgs = db.table("paquetes").select("*").eq("paquete_id", data.paquete_id).execute().data
    if not pkgs:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    pkg = pkgs[0]

    ins_id = next_id("inscripciones", "inscripcion_id", "INS")
    f_venc = data.fecha_inicio + timedelta(days=pkg["vigencia_dias"])
    row = {
        "inscripcion_id": ins_id,
        "alumno_id": data.alumno_id,
        "paquete_id": data.paquete_id,
        "fecha_inicio": str(data.fecha_inicio),
        "fecha_vencimiento": str(f_venc),
        "clases_usadas": 0,
        "clases_total": pkg["num_clases"],
        "estado": "activa",
    }
    result = db.table("inscripciones").insert(row).execute()
    return _to_inscripcion(result.data[0])


@router.get("/{inscripcion_id}/resumen", response_model=InscripcionResumen)
def resumen_inscripcion(inscripcion_id: str, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    ins_rows = db.table("inscripciones").select("*").eq("inscripcion_id", inscripcion_id).execute().data
    if not ins_rows:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    ins = _to_inscripcion(ins_rows[0])

    alu = db.table("alumnos").select("nombre").eq("alumno_id", ins["alumno_id"]).execute().data
    pkg = db.table("paquetes").select("nombre, precio").eq("paquete_id", ins["paquete_id"]).execute().data
    pagos = db.table("pagos").select("monto").eq("inscripcion_id", inscripcion_id).execute().data

    precio = float(pkg[0]["precio"]) if pkg else 0.0
    total_pagado = sum(float(p["monto"]) for p in pagos)

    return {
        **ins,
        "alumno_nombre": alu[0]["nombre"] if alu else "",
        "paquete_nombre": pkg[0]["nombre"] if pkg else "",
        "precio": precio,
        "total_pagado": total_pagado,
        "saldo_pendiente": max(0.0, precio - total_pagado),
    }


@router.post("/{inscripcion_id}/extender", response_model=Inscripcion)
def extender_inscripcion(inscripcion_id: str, data: InscripcionExtender, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    ins_rows = db.table("inscripciones").select("*").eq("inscripcion_id", inscripcion_id).execute().data
    if not ins_rows:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    ins = ins_rows[0]
    f_venc = date.fromisoformat(ins["fecha_vencimiento"]) + timedelta(days=data.dias_extra)
    updated = db.table("inscripciones").update({"fecha_vencimiento": str(f_venc)}) \
                .eq("inscripcion_id", inscripcion_id).execute().data
    return _to_inscripcion(updated[0])

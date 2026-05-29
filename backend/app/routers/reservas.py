from fastapi import APIRouter, HTTPException, Depends
from datetime import date
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Reserva, ReservaCreate, ReservaUpdate, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/reservas", tags=["reservas"])


def _enrich(rows: list[dict]) -> list[dict]:
    for r in rows:
        if isinstance(r.get("alumnos"), dict):
            r["alumno_nombre"] = r.pop("alumnos").get("nombre")
        if isinstance(r.get("canchas"), dict):
            r["cancha_nombre"] = r.pop("canchas").get("nombre")
    return rows


def _hay_conflicto(db, cancha_id: str, fecha: str, hora_inicio: str, hora_fin: str, exclude_id: str = "") -> bool:
    rows = db.table("reservas").select("reserva_id, hora_inicio, hora_fin") \
             .eq("cancha_id", cancha_id).eq("fecha", fecha) \
             .neq("estado", "cancelada").execute().data
    for r in rows:
        if r["reserva_id"] == exclude_id:
            continue
        # Solapamiento: A empieza antes de que B termine Y A termina después de que B empiece
        if r["hora_inicio"] < hora_fin and r["hora_fin"] > hora_inicio:
            return True
    return False


@router.get("/", response_model=list[Reserva])
def listar_reservas(
    fecha: Optional[str] = None,
    alumno_id: Optional[str] = None,
    _: UserInfo = Depends(get_current_user),
):
    db = get_db()
    q = db.table("reservas").select("*, alumnos(nombre), canchas(nombre)")
    if fecha:
        q = q.eq("fecha", fecha)
    if alumno_id:
        q = q.eq("alumno_id", alumno_id)
    rows = q.order("fecha").order("hora_inicio").execute().data
    return _enrich(rows)


@router.post("/", response_model=Reserva, status_code=201)
def crear_reserva(data: ReservaCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    if _hay_conflicto(db, data.cancha_id, str(data.fecha), data.hora_inicio, data.hora_fin):
        raise HTTPException(status_code=409, detail="Conflicto de horario en esta cancha")

    res_id = next_id("reservas", "reserva_id", "RES")
    row = {
        "reserva_id": res_id, "alumno_id": data.alumno_id, "cancha_id": data.cancha_id,
        "fecha": str(data.fecha), "hora_inicio": data.hora_inicio, "hora_fin": data.hora_fin,
        "estado": "pendiente", "notas": data.notas,
    }
    result = db.table("reservas").insert(row).execute()
    rows = db.table("reservas").select("*, alumnos(nombre), canchas(nombre)") \
             .eq("reserva_id", res_id).execute().data
    return _enrich(rows)[0]


@router.patch("/{reserva_id}", response_model=Reserva)
def editar_reserva(reserva_id: str, data: ReservaUpdate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")

    if "hora_inicio" in updates or "hora_fin" in updates:
        actual = db.table("reservas").select("*").eq("reserva_id", reserva_id).execute().data
        if not actual:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        r = actual[0]
        hi = updates.get("hora_inicio", r["hora_inicio"])
        hf = updates.get("hora_fin", r["hora_fin"])
        if _hay_conflicto(db, r["cancha_id"], r["fecha"], hi, hf, exclude_id=reserva_id):
            raise HTTPException(status_code=409, detail="Conflicto de horario en esta cancha")

    rows = db.table("reservas").update(updates).eq("reserva_id", reserva_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    enriched = db.table("reservas").select("*, alumnos(nombre), canchas(nombre)") \
                 .eq("reserva_id", reserva_id).execute().data
    return _enrich(enriched)[0]


@router.post("/{reserva_id}/convertir-clase", status_code=201)
def convertir_a_clase(reserva_id: str, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    res_rows = db.table("reservas").select("*").eq("reserva_id", reserva_id).execute().data
    if not res_rows:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    res = res_rows[0]

    ins_rows = db.table("inscripciones").select("*") \
                 .eq("alumno_id", res["alumno_id"]).eq("estado", "activa").execute().data
    if not ins_rows:
        raise HTTPException(status_code=400, detail="El alumno no tiene inscripción activa")
    ins = ins_rows[0]

    clase_id = next_id("clases", "clase_id", "CLS")
    db.table("clases").insert({
        "clase_id": clase_id, "alumno_id": res["alumno_id"],
        "inscripcion_id": ins["inscripcion_id"], "fecha": res["fecha"],
        "estado": "dada", "apuntes": "Convertida desde reserva",
    }).execute()

    nuevas_usadas = ins["clases_usadas"] + 1
    restantes = ins["clases_total"] - nuevas_usadas
    db.table("inscripciones").update({
        "clases_usadas": nuevas_usadas,
        "estado": "completada" if restantes <= 0 else "activa",
    }).eq("inscripcion_id", ins["inscripcion_id"]).execute()

    db.table("reservas").update({"estado": "confirmada"}).eq("reserva_id", reserva_id).execute()
    return {"clase_id": clase_id, "mensaje": "Clase registrada correctamente"}

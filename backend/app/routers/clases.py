"""Router de clases."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import ClaseCreate, ClaseUpdate
from app.services import sheets

router = APIRouter(prefix="/clases", tags=["clases"])

SHEET = sheets.SHEETS["clases"]
HEADERS = ["clase_id", "inscripcion_id", "alumno_id", "reserva_id", "fecha", "estado", "apuntes"]
INS_SHEET = sheets.SHEETS["inscripciones"]
INS_HEADERS = ["inscripcion_id", "alumno_id", "paquete_id", "fecha_inicio",
               "fecha_vencimiento", "clases_usadas", "clases_total", "estado"]


def _enrich_clase(clase: dict) -> dict:
    """Agrega nombre del alumno y cancha a la clase."""
    alumno, _ = sheets.find_row(sheets.SHEETS["alumnos"], "alumno_id", clase.get("alumno_id", ""))
    clase["alumno_nombre"] = alumno.get("nombre", "") if alumno else ""

    if clase.get("reserva_id"):
        reserva, _ = sheets.find_row(sheets.SHEETS["reservas"], "reserva_id", clase["reserva_id"])
        if reserva and reserva.get("cancha_id"):
            cancha, _ = sheets.find_row(sheets.SHEETS["canchas"], "cancha_id", reserva["cancha_id"])
            clase["cancha_nombre"] = cancha.get("nombre", "") if cancha else ""
            clase["hora_inicio"] = reserva.get("hora_inicio", "")
    return clase


@router.get("/hoy")
def clases_hoy(_user=Depends(get_current_user)):
    today = str(date.today())
    clases = sheets.read_sheet(SHEET)
    hoy = [c for c in clases if c.get("fecha") == today]
    hoy.sort(key=lambda c: c.get("hora_inicio", "00:00"))
    return [_enrich_clase(c) for c in hoy]


@router.get("/")
def listar(alumno_id: str = None, fecha: str = None, estado: str = None,
           _user=Depends(get_current_user)):
    clases = sheets.read_sheet(SHEET)
    if alumno_id:
        clases = [c for c in clases if c.get("alumno_id") == alumno_id]
    if fecha:
        clases = [c for c in clases if c.get("fecha", "").startswith(fecha)]
    if estado:
        clases = [c for c in clases if c.get("estado") == estado]
    clases.sort(key=lambda c: c.get("fecha", ""), reverse=True)
    return clases


@router.post("/", status_code=201)
def registrar(data: ClaseCreate, _user=Depends(get_current_user)):
    # Verificar inscripción
    ins, ins_num = sheets.find_row(INS_SHEET, "inscripcion_id", data.inscripcion_id)
    if not ins:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    clase_id = sheets.next_id(SHEET, "CLS")
    new_clase = {
        "clase_id": clase_id,
        "inscripcion_id": data.inscripcion_id,
        "alumno_id": data.alumno_id,
        "reserva_id": data.reserva_id or "",
        "fecha": data.fecha,
        "estado": data.estado,
        "apuntes": data.apuntes or "",
    }
    sheets.append_row(SHEET, HEADERS, new_clase)

    # Incrementar clases_usadas si la clase fue dada
    if data.estado == "dada":
        usadas = int(ins.get("clases_usadas", 0)) + 1
        total = int(ins.get("clases_total", 0))
        ins_updated = {
            **ins,
            "clases_usadas": str(usadas),
            "estado": "completado" if usadas >= total else "activo",
        }
        sheets.update_row(INS_SHEET, ins_num, INS_HEADERS, ins_updated)

    return new_clase


@router.patch("/{clase_id}")
def actualizar(clase_id: str, data: ClaseUpdate, _user=Depends(get_current_user)):
    row, row_num = sheets.find_row(SHEET, "clase_id", clase_id)
    if not row:
        raise HTTPException(status_code=404, detail="Clase no encontrada")

    estado_anterior = row.get("estado")
    updates = data.model_dump(exclude_none=True)
    updated = {**row, **updates}
    sheets.update_row(SHEET, row_num, HEADERS, updated)

    # Ajustar clases_usadas si cambia entre dada y faltante
    nuevo_estado = updates.get("estado")
    if nuevo_estado and nuevo_estado != estado_anterior:
        ins, ins_num = sheets.find_row(INS_SHEET, "inscripcion_id", row.get("inscripcion_id", ""))
        if ins:
            usadas = int(ins.get("clases_usadas", 0))
            if estado_anterior == "dada" and nuevo_estado != "dada":
                usadas = max(0, usadas - 1)
            elif estado_anterior != "dada" and nuevo_estado == "dada":
                usadas += 1
            ins_updated = {**ins, "clases_usadas": str(usadas)}
            sheets.update_row(INS_SHEET, ins_num, INS_HEADERS, ins_updated)

    return updated

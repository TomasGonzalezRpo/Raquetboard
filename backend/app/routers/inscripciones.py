"""Router de inscripciones."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import InscripcionCreate
from app.services import sheets

router = APIRouter(prefix="/inscripciones", tags=["inscripciones"])

SHEET = sheets.SHEETS["inscripciones"]
HEADERS = ["inscripcion_id", "alumno_id", "paquete_id", "fecha_inicio",
           "fecha_vencimiento", "clases_usadas", "clases_total", "estado"]


@router.get("/")
def listar(alumno_id: str = None, estado: str = None, _user=Depends(get_current_user)):
    rows = sheets.read_sheet(SHEET)
    if alumno_id:
        rows = [r for r in rows if r.get("alumno_id") == alumno_id]
    if estado:
        rows = [r for r in rows if r.get("estado") == estado]
    return rows


@router.post("/", status_code=201)
def crear(data: InscripcionCreate, _user=Depends(get_current_user)):
    # Verificar alumno y paquete existen
    alumno, _ = sheets.find_row(sheets.SHEETS["alumnos"], "alumno_id", data.alumno_id)
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")

    paquete, _ = sheets.find_row(sheets.SHEETS["paquetes"], "paquete_id", data.paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")

    # Calcular fecha de vencimiento
    fecha_inicio = date.fromisoformat(data.fecha_inicio)
    vigencia = int(paquete.get("vigencia_dias", 30))
    fecha_vencimiento = fecha_inicio + timedelta(days=vigencia)

    inscripcion_id = sheets.next_id(SHEET, "INS")
    new_row = {
        "inscripcion_id": inscripcion_id,
        "alumno_id": data.alumno_id,
        "paquete_id": data.paquete_id,
        "fecha_inicio": data.fecha_inicio,
        "fecha_vencimiento": str(fecha_vencimiento),
        "clases_usadas": "0",
        "clases_total": paquete.get("num_clases", "0"),
        "estado": "activo",
    }
    sheets.append_row(SHEET, HEADERS, new_row)
    return new_row


@router.get("/{inscripcion_id}/resumen")
def resumen(inscripcion_id: str, _user=Depends(get_current_user)):
    row, _ = sheets.find_row(SHEET, "inscripcion_id", inscripcion_id)
    if not row:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    usadas = int(row.get("clases_usadas", 0))
    total = int(row.get("clases_total", 0))
    vencimiento = row.get("fecha_vencimiento", "")

    dias = None
    if vencimiento:
        dias = (date.fromisoformat(vencimiento) - date.today()).days

    return {
        **row,
        "clases_restantes": total - usadas,
        "dias_hasta_vencimiento": dias,
        "porcentaje_usado": round((usadas / total * 100) if total > 0 else 0, 1),
    }

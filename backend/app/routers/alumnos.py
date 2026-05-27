"""Router de alumnos."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import AlumnoCreate, AlumnoUpdate
from app.services import sheets

router = APIRouter(prefix="/alumnos", tags=["alumnos"])

SHEET = sheets.SHEETS["alumnos"]
HEADERS = ["alumno_id", "nombre", "telefono",
           "email", "fecha_ingreso", "activo", "notas"]


def _enrich(alumno: dict) -> dict:
    """Agrega inscripcion_activa al alumno si existe."""
    ins_rows = sheets.read_sheet(sheets.SHEETS["inscripciones"])
    activa = next(
        (i for i in ins_rows
         if i.get("alumno_id") == alumno["alumno_id"] and i.get("estado") == "activo"),
        None,
    )
    if activa:
        # Adjunta nombre del paquete
        pkg, _ = sheets.find_row(
            sheets.SHEETS["paquetes"], "paquete_id", activa.get("paquete_id", ""))
        if pkg:
            activa["paquete_nombre"] = pkg.get("nombre", "")
    alumno["inscripcion_activa"] = activa
    return alumno


@router.get("/")
def listar(activo: bool = True, _user=Depends(get_current_user)):
    rows = sheets.read_sheet(SHEET)
    activo_str = "TRUE" if activo else "FALSE"
    filtered = [r for r in rows if r.get("activo", "TRUE") == activo_str]
    return [_enrich(r) for r in filtered]


@router.get("/{alumno_id}")
def obtener(alumno_id: str, _user=Depends(get_current_user)):
    row, _ = sheets.find_row(SHEET, "alumno_id", alumno_id)
    if not row:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return _enrich(row)


@router.get("/{alumno_id}/historial")
def historial(alumno_id: str, limite: int = 20, _user=Depends(get_current_user)):
    clases = sheets.read_sheet(sheets.SHEETS["clases"])
    alumno_clases = [c for c in clases if c.get("alumno_id") == alumno_id]
    alumno_clases.sort(key=lambda c: c.get("fecha", ""), reverse=True)
    return alumno_clases[:limite]


@router.post("/", status_code=201)
def crear(data: AlumnoCreate, _user=Depends(get_current_user)):
    alumno_id = sheets.next_id(SHEET, "ALU")
    new_row = {
        "alumno_id": alumno_id,
        "nombre": data.nombre,
        "telefono": data.telefono,
        "email": data.email or "",
        "fecha_ingreso": str(date.today()),
        "activo": "TRUE",
        "notas": data.notas or "",
    }
    sheets.append_row(SHEET, HEADERS, new_row)
    return new_row


@router.patch("/{alumno_id}")
def actualizar(alumno_id: str, data: AlumnoUpdate, _user=Depends(get_current_user)):
    row, row_num = sheets.find_row(SHEET, "alumno_id", alumno_id)
    if not row:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")

    updates = data.model_dump(exclude_none=True)
    if "activo" in updates:
        updates["activo"] = "TRUE" if updates["activo"] else "FALSE"

    updated = {**row, **updates}
    sheets.update_row(SHEET, row_num, HEADERS, updated)
    return updated

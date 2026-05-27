"""Router de reservas."""
from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import ReservaCreate, ReservaUpdate
from app.services import sheets

router = APIRouter(prefix="/reservas", tags=["reservas"])

SHEET = sheets.SHEETS["reservas"]
HEADERS = ["reserva_id", "alumno_id", "cancha_id", "fecha", "hora_inicio", "hora_fin", "estado", "notas"]


def _hay_conflicto(cancha_id: str, fecha: str, hora_inicio: str, hora_fin: str,
                   exclude_id: str = "") -> bool:
    reservas = sheets.read_sheet(SHEET)
    for r in reservas:
        if r.get("reserva_id") == exclude_id:
            continue
        if r.get("cancha_id") != cancha_id or r.get("fecha") != fecha:
            continue
        if r.get("estado") == "cancelada":
            continue
        # Verificar solapamiento de horario
        if r.get("hora_inicio", "") < hora_fin and r.get("hora_fin", "") > hora_inicio:
            return True
    return False


@router.get("/")
def listar(desde: str = None, hasta: str = None, alumno_id: str = None,
           _user=Depends(get_current_user)):
    reservas = sheets.read_sheet(SHEET)
    if desde:
        reservas = [r for r in reservas if r.get("fecha", "") >= desde]
    if hasta:
        reservas = [r for r in reservas if r.get("fecha", "") <= hasta]
    if alumno_id:
        reservas = [r for r in reservas if r.get("alumno_id") == alumno_id]
    reservas.sort(key=lambda r: (r.get("fecha", ""), r.get("hora_inicio", "")))
    return reservas


@router.post("/", status_code=201)
def crear(data: ReservaCreate, _user=Depends(get_current_user)):
    if _hay_conflicto(data.cancha_id, data.fecha, data.hora_inicio, data.hora_fin):
        raise HTTPException(status_code=409, detail="Conflicto de horario en esta cancha")

    reserva_id = sheets.next_id(SHEET, "RES")
    new_row = {
        "reserva_id": reserva_id,
        "alumno_id": data.alumno_id,
        "cancha_id": data.cancha_id,
        "fecha": data.fecha,
        "hora_inicio": data.hora_inicio,
        "hora_fin": data.hora_fin,
        "estado": "confirmada",
        "notas": data.notas or "",
    }
    sheets.append_row(SHEET, HEADERS, new_row)
    return new_row


@router.patch("/{reserva_id}")
def actualizar(reserva_id: str, data: ReservaUpdate, _user=Depends(get_current_user)):
    row, row_num = sheets.find_row(SHEET, "reserva_id", reserva_id)
    if not row:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    updates = data.model_dump(exclude_none=True)
    updated = {**row, **updates}

    # Re-verificar conflicto si cambia fecha/hora
    if any(k in updates for k in ("fecha", "hora_inicio", "hora_fin")):
        if _hay_conflicto(
            updated["cancha_id"], updated["fecha"],
            updated["hora_inicio"], updated["hora_fin"],
            exclude_id=reserva_id,
        ):
            raise HTTPException(status_code=409, detail="Conflicto de horario en esta cancha")

    sheets.update_row(SHEET, row_num, HEADERS, updated)
    return updated


@router.post("/{reserva_id}/convertir-clase", status_code=201)
def convertir_clase(reserva_id: str, _user=Depends(get_current_user)):
    """Convierte una reserva en clase registrada."""
    from app.routers.clases import registrar
    from app.models.schemas import ClaseCreate

    reserva, _ = sheets.find_row(SHEET, "reserva_id", reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Buscar inscripción activa del alumno
    ins_rows = sheets.read_sheet(sheets.SHEETS["inscripciones"])
    ins = next(
        (i for i in ins_rows
         if i.get("alumno_id") == reserva["alumno_id"] and i.get("estado") == "activo"),
        None,
    )
    if not ins:
        raise HTTPException(status_code=400, detail="El alumno no tiene inscripción activa")

    clase_data = ClaseCreate(
        inscripcion_id=ins["inscripcion_id"],
        alumno_id=reserva["alumno_id"],
        fecha=reserva["fecha"],
        estado="dada",
        reserva_id=reserva_id,
    )
    return registrar(clase_data, _user)

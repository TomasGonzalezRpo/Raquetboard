"""Router de pagos."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.models.schemas import PagoCreate, PagoUpdate
from app.services import sheets

router = APIRouter(prefix="/pagos", tags=["pagos"])

SHEET = sheets.SHEETS["pagos"]
HEADERS = ["pago_id", "inscripcion_id", "alumno_id",
           "fecha", "monto", "metodo", "notas"]


def _resumen_pagos(inscripcion_id: str) -> dict:
    """Calcula total pagado y saldo pendiente de una inscripción."""
    pagos = sheets.read_sheet(SHEET)
    pagos_ins = [p for p in pagos if p.get("inscripcion_id") == inscripcion_id]

    total_pagado = sum(float(p.get("monto", 0)) for p in pagos_ins)

    # Obtener precio del paquete
    ins, _ = sheets.find_row(
        sheets.SHEETS["inscripciones"], "inscripcion_id", inscripcion_id)
    precio_paquete = 0.0
    if ins:
        pkg, _ = sheets.find_row(
            sheets.SHEETS["paquetes"], "paquete_id", ins.get("paquete_id", ""))
        if pkg:
            precio_paquete = float(pkg.get("precio", 0))

    return {
        "total_pagado": total_pagado,
        "precio_paquete": precio_paquete,
        "saldo_pendiente": max(0.0, precio_paquete - total_pagado),
        "pagado_completo": total_pagado >= precio_paquete,
        "pagos": pagos_ins,
    }


@router.get("/")
def listar(alumno_id: str = None, inscripcion_id: str = None,
           _user=Depends(get_current_user)):
    """Lista pagos filtrables por alumno o inscripción."""
    pagos = sheets.read_sheet(SHEET)
    if alumno_id:
        pagos = [p for p in pagos if p.get("alumno_id") == alumno_id]
    if inscripcion_id:
        pagos = [p for p in pagos if p.get("inscripcion_id") == inscripcion_id]
    pagos.sort(key=lambda p: p.get("fecha", ""), reverse=True)
    return pagos


@router.get("/resumen/{inscripcion_id}")
def resumen(inscripcion_id: str, _user=Depends(get_current_user)):
    """Devuelve total pagado, saldo pendiente y lista de pagos de una inscripción."""
    ins, _ = sheets.find_row(
        sheets.SHEETS["inscripciones"], "inscripcion_id", inscripcion_id)
    if not ins:
        raise HTTPException(
            status_code=404, detail="Inscripción no encontrada")
    return _resumen_pagos(inscripcion_id)


@router.get("/alumno/{alumno_id}/resumen")
def resumen_alumno(alumno_id: str, _user=Depends(get_current_user)):
    """Resumen de pagos del alumno en su inscripción activa."""
    ins_rows = sheets.read_sheet(sheets.SHEETS["inscripciones"])
    ins_activa = next(
        (i for i in ins_rows
         if i.get("alumno_id") == alumno_id and i.get("estado") == "activo"),
        None,
    )
    if not ins_activa:
        raise HTTPException(
            status_code=404, detail="El alumno no tiene inscripción activa")
    return _resumen_pagos(ins_activa["inscripcion_id"])


@router.post("/", status_code=201)
def registrar(data: PagoCreate, _user=Depends(get_current_user)):
    """Registra un pago para una inscripción."""
    ins, _ = sheets.find_row(
        sheets.SHEETS["inscripciones"], "inscripcion_id", data.inscripcion_id)
    if not ins:
        raise HTTPException(
            status_code=404, detail="Inscripción no encontrada")

    pago_id = sheets.next_id(SHEET, "PAG")
    new_row = {
        "pago_id": pago_id,
        "inscripcion_id": data.inscripcion_id,
        "alumno_id": data.alumno_id,
        "fecha": data.fecha or str(date.today()),
        "monto": str(data.monto),
        "metodo": data.metodo,
        "notas": data.notas or "",
    }
    sheets.append_row(SHEET, HEADERS, new_row)

    # Devuelve el pago + resumen actualizado
    resumen = _resumen_pagos(data.inscripcion_id)
    return {**new_row, "resumen": resumen}


@router.patch("/{pago_id}")
def actualizar(pago_id: str, data: PagoUpdate, _user=Depends(get_current_user)):
    """Edita un pago existente."""
    row, row_num = sheets.find_row(SHEET, "pago_id", pago_id)
    if not row:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    updates = data.model_dump(exclude_none=True)
    if "monto" in updates:
        updates["monto"] = str(updates["monto"])

    updated = {**row, **updates}
    sheets.update_row(SHEET, row_num, HEADERS, updated)
    return updated


@router.delete("/{pago_id}", status_code=204)
def eliminar(pago_id: str, _user=Depends(get_current_user)):
    """Elimina un pago (marca como eliminado sobreescribiendo con vacío)."""
    row, row_num = sheets.find_row(SHEET, "pago_id", pago_id)
    if not row:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    # Sobreescribe con fila vacía para no desplazar filas
    empty = {h: "" for h in HEADERS}
    sheets.update_row(SHEET, row_num, HEADERS, empty)

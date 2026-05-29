from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.schemas import Pago, PagoCreate, PagoUpdate, PagosResumen, UserInfo
from app.services.db import get_db, next_id

router = APIRouter(prefix="/pagos", tags=["pagos"])


@router.get("/", response_model=list[Pago])
def listar_pagos(
    inscripcion_id: Optional[str] = None,
    alumno_id: Optional[str] = None,
    _: UserInfo = Depends(get_current_user),
):
    db = get_db()
    q = db.table("pagos").select("*")
    if inscripcion_id:
        q = q.eq("inscripcion_id", inscripcion_id)
    if alumno_id:
        q = q.eq("alumno_id", alumno_id)
    return q.order("fecha", desc=True).execute().data


@router.get("/resumen/{inscripcion_id}", response_model=PagosResumen)
def resumen_pagos(inscripcion_id: str, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    ins = db.table("inscripciones").select("paquete_id").eq("inscripcion_id", inscripcion_id).execute().data
    if not ins:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    pkg = db.table("paquetes").select("precio").eq("paquete_id", ins[0]["paquete_id"]).execute().data
    precio = float(pkg[0]["precio"]) if pkg else 0.0

    pagos = db.table("pagos").select("*").eq("inscripcion_id", inscripcion_id) \
              .order("fecha", desc=True).execute().data
    total_pagado = sum(float(p["monto"]) for p in pagos)
    saldo = max(0.0, precio - total_pagado)

    return {
        "inscripcion_id": inscripcion_id,
        "precio_paquete": precio,
        "total_pagado": total_pagado,
        "saldo_pendiente": saldo,
        "pagado_completo": saldo == 0.0,
        "pagos": pagos,
    }


@router.post("/", response_model=Pago, status_code=201)
def registrar_pago(data: PagoCreate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    ins = db.table("inscripciones").select("alumno_id").eq("inscripcion_id", data.inscripcion_id).execute().data
    if not ins:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    pago_id = next_id("pagos", "pago_id", "PAG")
    row = {
        "pago_id": pago_id, "inscripcion_id": data.inscripcion_id,
        "alumno_id": ins[0]["alumno_id"], "monto": float(data.monto),
        "metodo": data.metodo, "fecha": str(data.fecha), "notas": data.notas,
    }
    return db.table("pagos").insert(row).execute().data[0]


@router.patch("/{pago_id}", response_model=Pago)
def editar_pago(pago_id: str, data: PagoUpdate, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")
    rows = db.table("pagos").update(updates).eq("pago_id", pago_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return rows[0]


@router.delete("/{pago_id}", status_code=204)
def eliminar_pago(pago_id: str, _: UserInfo = Depends(get_current_user)):
    db = get_db()
    rows = db.table("pagos").delete().eq("pago_id", pago_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

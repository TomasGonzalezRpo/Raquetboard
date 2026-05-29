from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import date

from app.config import settings
from app.dependencies.auth import get_current_user
from app.models.schemas import DashboardMetricas, AlertaVencimiento, UserInfo
from app.services.db import get_db
from app.routers import auth, alumnos, paquetes, inscripciones, clases, reservas, pagos, canchas, notificaciones

app = FastAPI(
    title="Raquetboard API",
    description="Sistema de Gestión de Clases de Tenis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(alumnos.router)
app.include_router(paquetes.router)
app.include_router(inscripciones.router)
app.include_router(clases.router)
app.include_router(reservas.router)
app.include_router(pagos.router)
app.include_router(canchas.router)
app.include_router(notificaciones.router)


@app.get("/")
def root():
    return {"message": "Raquetboard API v1.0", "status": "ok"}


@app.get("/dashboard/metricas", response_model=DashboardMetricas)
def dashboard_metricas(_: UserInfo = Depends(get_current_user)):
    db = get_db()
    hoy = str(date.today())

    clases_hoy = db.table("clases").select("estado").eq("fecha", hoy).execute().data
    alumnos_activos = db.table("alumnos").select("alumno_id").eq("activo", True).execute().data

    # Inscripciones activas con ≤1 clase restante o vencimiento en ≤5 días
    ins_activas = db.table("inscripciones").select(
        "inscripcion_id, clases_usadas, clases_total, fecha_vencimiento"
    ).eq("estado", "activa").execute().data

    por_vencer = 0
    for i in ins_activas:
        restantes = i["clases_total"] - i["clases_usadas"]
        try:
            dias = (date.fromisoformat(i["fecha_vencimiento"]) - date.today()).days
        except Exception:
            dias = 999
        if restantes <= 1 or dias <= 5:
            por_vencer += 1

    return DashboardMetricas(
        clases_hoy=len(clases_hoy),
        alumnos_activos=len(alumnos_activos),
        clases_completadas_hoy=sum(1 for c in clases_hoy if c["estado"] == "dada"),
        paquetes_por_vencer=por_vencer,
    )


@app.get("/dashboard/alertas", response_model=list[AlertaVencimiento])
def dashboard_alertas(_: UserInfo = Depends(get_current_user)):
    db = get_db()
    ins_activas = db.table("inscripciones").select(
        "inscripcion_id, alumno_id, clases_usadas, clases_total, fecha_vencimiento, alumnos(nombre)"
    ).eq("estado", "activa").execute().data

    alertas = []
    for i in ins_activas:
        restantes = max(0, i["clases_total"] - i["clases_usadas"])
        nombre = i.get("alumnos", {}).get("nombre", "") if isinstance(i.get("alumnos"), dict) else ""
        try:
            dias = (date.fromisoformat(i["fecha_vencimiento"]) - date.today()).days
        except Exception:
            dias = None

        if restantes <= 1:
            alertas.append(AlertaVencimiento(
                alumno_id=i["alumno_id"], alumno_nombre=nombre,
                inscripcion_id=i["inscripcion_id"], clases_restantes=restantes,
                dias_para_vencer=dias, tipo="clases",
            ))
        elif dias is not None and dias <= 5:
            alertas.append(AlertaVencimiento(
                alumno_id=i["alumno_id"], alumno_nombre=nombre,
                inscripcion_id=i["inscripcion_id"], clases_restantes=restantes,
                dias_para_vencer=dias, tipo="vencimiento",
            ))

    return alertas

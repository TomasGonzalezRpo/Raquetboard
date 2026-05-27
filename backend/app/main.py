"""Punto de entrada de Raquetboard API."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, alumnos, clases, reservas, paquetes, inscripciones, canchas, notificaciones, pagos

settings = get_settings()

app = FastAPI(
    title="Raquetboard API",
    description="API para gestión de clases de tenis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# CORS — permite peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de routers
app.include_router(auth.router)
app.include_router(alumnos.router)
app.include_router(clases.router)
app.include_router(reservas.router)
app.include_router(paquetes.router)
app.include_router(inscripciones.router)
app.include_router(canchas.router)
app.include_router(notificaciones.router)
app.include_router(pagos.router)


@app.get("/health")
def health():
    """Endpoint de health check para Cloud Run."""
    return {"status": "ok", "app": "raquetboard"}

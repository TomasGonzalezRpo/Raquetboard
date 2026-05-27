"""Modelos Pydantic para validación de datos de entrada y salida."""
from pydantic import BaseModel
from typing import Optional


# ── Alumno ─────────────────────────────────────────────────────

class AlumnoCreate(BaseModel):
    nombre: str
    telefono: str
    email: Optional[str] = ""
    notas: Optional[str] = ""


class AlumnoUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    notas: Optional[str] = None
    activo: Optional[bool] = None


# ── Paquete ────────────────────────────────────────────────────

class PaqueteCreate(BaseModel):
    nombre: str
    num_clases: int
    precio: float
    vigencia_dias: int


class PaqueteUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    vigencia_dias: Optional[int] = None
    activo: Optional[bool] = None


# ── Inscripcion ────────────────────────────────────────────────

class InscripcionCreate(BaseModel):
    alumno_id: str
    paquete_id: str
    fecha_inicio: str  # YYYY-MM-DD


# ── Clase ──────────────────────────────────────────────────────

class ClaseCreate(BaseModel):
    inscripcion_id: str
    alumno_id: str
    fecha: str  # YYYY-MM-DD
    estado: str  # dada | faltante | cancelada
    reserva_id: Optional[str] = ""
    apuntes: Optional[str] = ""


class ClaseUpdate(BaseModel):
    estado: Optional[str] = None
    apuntes: Optional[str] = None


# ── Reserva ────────────────────────────────────────────────────

class ReservaCreate(BaseModel):
    alumno_id: str
    cancha_id: str
    fecha: str  # YYYY-MM-DD
    hora_inicio: str  # HH:MM
    hora_fin: str     # HH:MM
    notas: Optional[str] = ""


class ReservaUpdate(BaseModel):
    estado: Optional[str] = None
    fecha: Optional[str] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    notas: Optional[str] = None


# ── Cancha ─────────────────────────────────────────────────────

class CanchaCreate(BaseModel):
    nombre: str
    ubicacion: str
    superficie: Optional[str] = ""


# ── Pagos ──────────────────────────────────────────────────────

class PagoCreate(BaseModel):
    inscripcion_id: str
    alumno_id: str
    fecha: str  # YYYY-MM-DD
    monto: float
    metodo: str  # efectivo | transferencia | otro
    notas: Optional[str] = ""


class PagoUpdate(BaseModel):
    monto: Optional[float] = None
    metodo: Optional[str] = None
    notas: Optional[str] = None


# ── Notificaciones ─────────────────────────────────────────────

class PushSuscripcion(BaseModel):
    endpoint: str
    keys: dict


class PushMensaje(BaseModel):
    titulo: str
    mensaje: str
    url: Optional[str] = "/"

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime


# ── Alumnos ────────────────────────────────────────────────────────────────────

class AlumnoBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    notas: Optional[str] = None


class AlumnoCreate(AlumnoBase):
    pass


class AlumnoUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    notas: Optional[str] = None
    activo: Optional[bool] = None


class Alumno(AlumnoBase):
    alumno_id: str
    activo: bool = True
    clases_restantes: Optional[int] = None


# ── Paquetes ───────────────────────────────────────────────────────────────────

class PaqueteBase(BaseModel):
    nombre: str
    num_clases: int
    precio: float
    vigencia_dias: int


class PaqueteCreate(PaqueteBase):
    pass


class PaqueteUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    vigencia_dias: Optional[int] = None
    activo: Optional[bool] = None


class Paquete(PaqueteBase):
    paquete_id: str
    activo: bool = True
    costo_por_clase: float


# ── Inscripciones ──────────────────────────────────────────────────────────────

class InscripcionCreate(BaseModel):
    alumno_id: str
    paquete_id: str
    fecha_inicio: date


class InscripcionExtender(BaseModel):
    dias_extra: int


class Inscripcion(BaseModel):
    inscripcion_id: str
    alumno_id: str
    paquete_id: str
    fecha_inicio: str
    fecha_vencimiento: str
    clases_usadas: int
    clases_total: int
    clases_restantes: int
    estado: Literal["activa", "completada", "vencida"]


class InscripcionResumen(Inscripcion):
    alumno_nombre: str
    paquete_nombre: str
    precio: float
    total_pagado: float
    saldo_pendiente: float


# ── Clases ─────────────────────────────────────────────────────────────────────

class ClaseCreate(BaseModel):
    alumno_id: str
    inscripcion_id: str
    fecha: date
    estado: Literal["dada", "falto"]
    apuntes: Optional[str] = None


class ClaseUpdate(BaseModel):
    estado: Optional[Literal["dada", "falto"]] = None
    apuntes: Optional[str] = None


class Clase(BaseModel):
    clase_id: str
    alumno_id: str
    inscripcion_id: str
    fecha: str
    estado: Literal["dada", "falto"]
    apuntes: Optional[str] = None
    alumno_nombre: Optional[str] = None


# ── Reservas ───────────────────────────────────────────────────────────────────

class ReservaCreate(BaseModel):
    alumno_id: str
    cancha_id: str
    fecha: date
    hora_inicio: str  # "HH:MM"
    hora_fin: str     # "HH:MM"
    notas: Optional[str] = None


class ReservaUpdate(BaseModel):
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[Literal["pendiente", "confirmada", "cancelada"]] = None


class Reserva(BaseModel):
    reserva_id: str
    alumno_id: str
    cancha_id: str
    fecha: str
    hora_inicio: str
    hora_fin: str
    estado: Literal["pendiente", "confirmada", "cancelada"]
    notas: Optional[str] = None
    alumno_nombre: Optional[str] = None
    cancha_nombre: Optional[str] = None


# ── Pagos ──────────────────────────────────────────────────────────────────────

class PagoCreate(BaseModel):
    inscripcion_id: str
    monto: float
    metodo: Literal["efectivo", "transferencia", "otro"]
    fecha: date
    notas: Optional[str] = None


class PagoUpdate(BaseModel):
    monto: Optional[float] = None
    metodo: Optional[Literal["efectivo", "transferencia", "otro"]] = None
    notas: Optional[str] = None


class Pago(BaseModel):
    pago_id: str
    inscripcion_id: str
    monto: float
    metodo: Literal["efectivo", "transferencia", "otro"]
    fecha: str
    notas: Optional[str] = None


class PagosResumen(BaseModel):
    inscripcion_id: str
    precio_paquete: float
    total_pagado: float
    saldo_pendiente: float
    pagado_completo: bool
    pagos: list[Pago]


# ── Canchas ────────────────────────────────────────────────────────────────────

class CanchaCreate(BaseModel):
    nombre: str
    ubicacion: Optional[str] = None
    superficie: Optional[str] = None


class CanchaUpdate(BaseModel):
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None
    superficie: Optional[str] = None
    activa: Optional[bool] = None


class Cancha(BaseModel):
    cancha_id: str
    nombre: str
    ubicacion: Optional[str] = None
    superficie: Optional[str] = None
    activa: bool = True


# ── Auth ───────────────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserInfo(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None


# ── Notificaciones ─────────────────────────────────────────────────────────────

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


class PushMessage(BaseModel):
    title: str
    body: str
    url: Optional[str] = None


# ── Dashboard ──────────────────────────────────────────────────────────────────

class DashboardMetricas(BaseModel):
    clases_hoy: int
    alumnos_activos: int
    clases_completadas_hoy: int
    paquetes_por_vencer: int


class AlertaVencimiento(BaseModel):
    alumno_id: str
    alumno_nombre: str
    inscripcion_id: str
    clases_restantes: int
    dias_para_vencer: Optional[int] = None
    tipo: Literal["clases", "vencimiento"]

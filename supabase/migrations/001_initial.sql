-- ============================================================
-- Raquetboard — Schema inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Alumnos
CREATE TABLE alumnos (
  alumno_id    TEXT PRIMARY KEY,
  nombre       TEXT NOT NULL,
  telefono     TEXT,
  activo       BOOLEAN NOT NULL DEFAULT true,
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paquetes
CREATE TABLE paquetes (
  paquete_id   TEXT PRIMARY KEY,
  nombre       TEXT NOT NULL,
  num_clases   INTEGER NOT NULL CHECK (num_clases > 0),
  precio       NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  vigencia_dias INTEGER NOT NULL CHECK (vigencia_dias > 0),
  activo       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inscripciones
CREATE TABLE inscripciones (
  inscripcion_id   TEXT PRIMARY KEY,
  alumno_id        TEXT NOT NULL REFERENCES alumnos(alumno_id),
  paquete_id       TEXT NOT NULL REFERENCES paquetes(paquete_id),
  fecha_inicio     DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  clases_usadas    INTEGER NOT NULL DEFAULT 0,
  clases_total     INTEGER NOT NULL,
  estado           TEXT NOT NULL DEFAULT 'activa'
                   CHECK (estado IN ('activa', 'completada', 'vencida')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clases
CREATE TABLE clases (
  clase_id        TEXT PRIMARY KEY,
  alumno_id       TEXT NOT NULL REFERENCES alumnos(alumno_id),
  inscripcion_id  TEXT NOT NULL REFERENCES inscripciones(inscripcion_id),
  fecha           DATE NOT NULL,
  estado          TEXT NOT NULL CHECK (estado IN ('dada', 'falto')),
  apuntes         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canchas
CREATE TABLE canchas (
  cancha_id   TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  ubicacion   TEXT,
  superficie  TEXT,
  activa      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reservas
CREATE TABLE reservas (
  reserva_id  TEXT PRIMARY KEY,
  alumno_id   TEXT NOT NULL REFERENCES alumnos(alumno_id),
  cancha_id   TEXT NOT NULL REFERENCES canchas(cancha_id),
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  estado      TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  notas       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

-- Pagos
CREATE TABLE pagos (
  pago_id        TEXT PRIMARY KEY,
  inscripcion_id TEXT NOT NULL REFERENCES inscripciones(inscripcion_id),
  alumno_id      TEXT NOT NULL REFERENCES alumnos(alumno_id),
  monto          NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo         TEXT NOT NULL CHECK (metodo IN ('efectivo', 'transferencia', 'otro')),
  fecha          DATE NOT NULL,
  notas          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push Subscriptions
CREATE TABLE push_subscriptions (
  id        SERIAL PRIMARY KEY,
  endpoint  TEXT UNIQUE NOT NULL,
  p256dh    TEXT NOT NULL,
  auth      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Índices para consultas frecuentes ──────────────────────

CREATE INDEX idx_inscripciones_alumno ON inscripciones(alumno_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX idx_clases_alumno        ON clases(alumno_id);
CREATE INDEX idx_clases_fecha         ON clases(fecha);
CREATE INDEX idx_reservas_fecha       ON reservas(fecha);
CREATE INDEX idx_reservas_cancha      ON reservas(cancha_id, fecha);
CREATE INDEX idx_pagos_inscripcion    ON pagos(inscripcion_id);

-- ── Row Level Security (deshabilitar para service_role) ────
-- El backend usa service_role key → acceso total sin RLS.
-- Si en el futuro agregás acceso directo desde el cliente,
-- habilitá RLS y creá políticas aquí.

ALTER TABLE alumnos           DISABLE ROW LEVEL SECURITY;
ALTER TABLE paquetes          DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones     DISABLE ROW LEVEL SECURITY;
ALTER TABLE clases            DISABLE ROW LEVEL SECURITY;
ALTER TABLE canchas           DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas          DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos             DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;

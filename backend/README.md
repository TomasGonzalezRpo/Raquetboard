# Raquetboard — Backend

API REST construida con FastAPI + Python para la gestión de clases de tenis.

## Requisitos
- Python 3.12+
- Cuenta de servicio de Google con acceso al Spreadsheet

## Desarrollo local

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # completar variables
uvicorn app.main:app --reload
```

La API queda disponible en `http://localhost:8000`.
Documentación interactiva en `http://localhost:8000/docs`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth |
| `GOOGLE_REDIRECT_URI` | URI de callback (debe coincidir con Google Console) |
| `GOOGLE_SHEETS_ID` | ID del Google Spreadsheet |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON completo de la cuenta de servicio |
| `JWT_SECRET` | Clave secreta para firmar tokens (mín. 32 caracteres) |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID para push notifications |
| `VAPID_PUBLIC_KEY` | Clave pública VAPID |
| `VAPID_CLAIMS_EMAIL` | Email para identificación VAPID |
| `ALLOWED_EMAIL` | Único email autorizado para acceder |
| `FRONTEND_URL` | URL del frontend (para CORS y redirección OAuth) |

## Estructura del Google Spreadsheet

Crear un Spreadsheet con estas hojas (nombres exactos):

| Hoja | Columnas |
|---|---|
| `Alumnos` | alumno_id, nombre, telefono, email, fecha_ingreso, activo, notas |
| `Paquetes` | paquete_id, nombre, num_clases, precio, vigencia_dias, activo |
| `Inscripciones` | inscripcion_id, alumno_id, paquete_id, fecha_inicio, fecha_vencimiento, clases_usadas, clases_total, estado |
| `Clases` | clase_id, inscripcion_id, alumno_id, reserva_id, fecha, estado, apuntes |
| `Reservas` | reserva_id, alumno_id, cancha_id, fecha, hora_inicio, hora_fin, estado, notas |
| `Canchas` | cancha_id, nombre, ubicacion, superficie, activo |
| `PushSuscripciones` | sub_id, endpoint, subscription_json, fecha_registro, activo |

## Deploy en Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/raquetboard-backend
gcloud run deploy raquetboard-backend \
  --image gcr.io/PROJECT_ID/raquetboard-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "ALLOWED_EMAIL=tu@email.com,..."
```

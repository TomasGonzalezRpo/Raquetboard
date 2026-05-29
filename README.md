# Raquetboard 🎾

Sistema de Gestión de Clases de Tenis · PWA · v1.0

## Stack

| Capa | Tecnología | Hosting |
|------|-----------|---------|
| Frontend | React + Vite + PWA | Vercel |
| Backend | FastAPI (Python) | Google Cloud Run |
| Base de datos | Google Sheets (7 hojas) | Google Drive |
| Auth | Google OAuth 2.0 + JWT | — |
| Push | pywebpush | — |

---

## Estructura del monorepo

```
raquetboard/
  frontend/          # React + Vite PWA
  backend/           # FastAPI
  .github/workflows/ # CI/CD automático
```

---

## Setup paso a paso

### 1. Google Sheets — Base de datos

1. Creá un nuevo Spreadsheet en Google Drive
2. Renombrá las hojas con estos nombres exactos (sensible a mayúsculas):

| Hoja | Encabezados (fila 1) |
|------|---------------------|
| `Alumnos` | alumno_id, nombre, telefono, activo, notas |
| `Paquetes` | paquete_id, nombre, num_clases, precio, vigencia_dias, activo |
| `Inscripciones` | inscripcion_id, alumno_id, paquete_id, fecha_inicio, fecha_vencimiento, clases_usadas, clases_total, estado |
| `Clases` | clase_id, alumno_id, inscripcion_id, fecha, estado, apuntes |
| `Reservas` | reserva_id, alumno_id, cancha_id, fecha, hora_inicio, hora_fin, estado, notas |
| `Pagos` | pago_id, inscripcion_id, alumno_id, monto, metodo, fecha, notas |
| `Canchas` | cancha_id, nombre, ubicacion, superficie, activa |
| `PushSubscriptions` | endpoint, p256dh, auth |

3. Copiá el ID del Spreadsheet de la URL: `https://docs.google.com/spreadsheets/d/**ESTE_ID**/edit`

### 2. Google Cloud — Service Account

1. Ir a [Google Cloud Console](https://console.cloud.google.com) → Nuevo proyecto
2. Habilitar APIs:
   - **Google Sheets API**
   - **Google Drive API**
3. Crear Service Account:
   - IAM & Admin → Service Accounts → Crear
   - Nombre: `raquetboard-sheets`
   - Rol: ninguno necesario
4. Descargar JSON de credenciales → renombrarlo `service_account.json`
5. Compartir el Spreadsheet con el email del Service Account (Editor)

### 3. Google OAuth 2.0

1. En la misma consola → APIs & Services → Credentials → Create OAuth Client
2. Tipo: **Web application**
3. Agregar URI de redirección: `https://TU-BACKEND.run.app/auth/callback`
4. Copiar **Client ID** y **Client Secret**

### 4. Generar claves VAPID (para notificaciones push)

```bash
cd backend
pip install pywebpush
python -c "
from pywebpush import Vapid
v = Vapid()
v.generate_keys()
print('Private:', v.private_key)
print('Public:', v.public_key)
"
```

### 5. Backend — Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y completar:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://TU-BACKEND.run.app/auth/callback
JWT_SECRET=una-cadena-larga-y-aleatoria
ALLOWED_EMAIL=tomasgonzalez569@gmail.com
FRONTEND_URL=https://TU-FRONTEND.vercel.app
SPREADSHEET_ID=...
VAPID_PRIVATE_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_CLAIMS_EMAIL=tomasgonzalez569@gmail.com
```

También copiar `service_account.json` al directorio `backend/`.

### 6. Frontend — Variables de entorno

Copiar `frontend/.env.example` a `frontend/.env.local`:

```env
VITE_API_URL=https://TU-BACKEND.run.app
VITE_VAPID_PUBLIC_KEY=tu-vapid-public-key
```

---

## Desarrollo local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # y completar
uvicorn app.main:app --reload --port 8080
```

API disponible en `http://localhost:8080`
Docs: `http://localhost:8080/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # y completar
npm run dev
```

App en `http://localhost:5173`

---

## Deploy en producción

### Backend → Google Cloud Run

```bash
cd backend
gcloud builds submit --tag gcr.io/TU_PROJECT/raquetboard-api
gcloud run deploy raquetboard-api \
  --image gcr.io/TU_PROJECT/raquetboard-api \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLIENT_ID=..." # (resto de variables)
```

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel --prod
```

O configurar deploy automático desde GitHub (recomendado).

### GitHub Actions — Secrets requeridos

En tu repo → Settings → Secrets:

| Secret | Descripción |
|--------|------------|
| `VERCEL_TOKEN` | Token de Vercel |
| `VERCEL_ORG_ID` | ID de organización Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto Vercel |
| `VITE_API_URL` | URL del backend en Cloud Run |
| `VITE_VAPID_PUBLIC_KEY` | Clave pública VAPID |
| `GCP_PROJECT_ID` | ID del proyecto GCP |
| `GCP_SA_KEY` | JSON completo de la Service Account |
| `GOOGLE_CLIENT_ID` | OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | URL de callback OAuth |
| `JWT_SECRET` | Clave secreta para firmar JWTs |
| `ALLOWED_EMAIL` | Email del profesor autorizado |
| `FRONTEND_URL` | URL del frontend en Vercel |
| `SPREADSHEET_ID` | ID del Spreadsheet |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID |
| `VAPID_PUBLIC_KEY` | Clave pública VAPID |
| `VAPID_CLAIMS_EMAIL` | Email para claims VAPID |

---

## Convención de IDs

| Entidad | Prefijo | Ejemplo |
|---------|---------|---------|
| Alumnos | ALU | ALU-001 |
| Paquetes | PKG | PKG-001 |
| Inscripciones | INS | INS-001 |
| Clases | CLS | CLS-001 |
| Reservas | RES | RES-001 |
| Canchas | CAN | CAN-001 |
| Pagos | PAG | PAG-001 |

---

## Fases

- **Fase 1 (MVP)** ✅ Auth, Dashboard, Alumnos, Paquetes, Clases, Agenda, Pagos, Push
- **Fase 2** → Recordatorios automáticos, reportes mensuales, extensión de vencimientos
- **Fase 3** → Portal de alumnos (vista de solo lectura con cuenta Google)

# Raquetboard — Frontend

PWA para gestión de clases de tenis. Construida con React + Vite.

## Requisitos
- Node 18+
- Backend corriendo en `http://localhost:8000`

## Desarrollo
```bash
npm install
cp .env.example .env   # completar variables
npm run dev
```

## Variables de entorno
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend FastAPI |
| `VITE_VAPID_PUBLIC_KEY` | Clave pública VAPID para push |

## Build
```bash
npm run build
```

## Deploy
Conectar el repositorio a Vercel. Configurar las variables de entorno en el dashboard de Vercel.

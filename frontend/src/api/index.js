import { api } from "./client";

export { alumnos } from "./alumnos";

export const paquetes = {
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/paquetes${q ? "?" + q : ""}`);
  },
  crear: (data) => api.post("/paquetes", data),
  editar: (id, data) => api.patch(`/paquetes/${id}`, data),
};

export const inscripciones = {
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/inscripciones${q ? "?" + q : ""}`);
  },
  crear: (data) => api.post("/inscripciones", data),
  resumen: (id) => api.get(`/inscripciones/${id}/resumen`),
  extender: (id, dias) => api.post(`/inscripciones/${id}/extender`, { dias_extra: dias }),
};

export const clases = {
  hoy: () => api.get("/clases/hoy"),
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/clases${q ? "?" + q : ""}`);
  },
  registrar: (data) => api.post("/clases", data),
  editar: (id, data) => api.patch(`/clases/${id}`, data),
};

export const reservas = {
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/reservas${q ? "?" + q : ""}`);
  },
  crear: (data) => api.post("/reservas", data),
  editar: (id, data) => api.patch(`/reservas/${id}`, data),
  convertirClase: (id) => api.post(`/reservas/${id}/convertir-clase`),
};

export const pagos = {
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/pagos${q ? "?" + q : ""}`);
  },
  resumen: (inscripcionId) => api.get(`/pagos/resumen/${inscripcionId}`),
  registrar: (data) => api.post("/pagos", data),
  editar: (id, data) => api.patch(`/pagos/${id}`, data),
  eliminar: (id) => api.delete(`/pagos/${id}`),
};

export const canchas = {
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/canchas${q ? "?" + q : ""}`);
  },
  crear: (data) => api.post("/canchas", data),
  editar: (id, data) => api.patch(`/canchas/${id}`, data),
};

export const dashboard = {
  metricas: () => api.get("/dashboard/metricas"),
  alertas: () => api.get("/dashboard/alertas"),
};

export const auth = {
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  loginUrl: () => `${import.meta.env.VITE_API_URL || "/api"}/auth/login`,
};

export const notificaciones = {
  suscribir: (sub) => api.post("/notificaciones/suscribir", sub),
};

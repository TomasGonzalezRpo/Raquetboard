import { api } from "./client";

export const alumnosAPI = {
  listar: (activo = true) => api.get(`/alumnos?activo=${activo}`),
  obtener: (id) => api.get(`/alumnos/${id}`),
  historial: (id, params = "") => api.get(`/alumnos/${id}/historial${params}`),
  crear: (data) => api.post("/alumnos", data),
  actualizar: (id, data) => api.patch(`/alumnos/${id}`, data),
};

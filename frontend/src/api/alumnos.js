import { api } from "./client";

export const alumnos = {
  listar: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/alumnos${q ? "?" + q : ""}`);
  },
  obtener: (id) => api.get(`/alumnos/${id}`),
  crear: (data) => api.post("/alumnos", data),
  editar: (id, data) => api.patch(`/alumnos/${id}`, data),
  archivar: (id) => api.patch(`/alumnos/${id}`, { activo: false }),
  historial: (id) => api.get(`/alumnos/${id}/historial`),
};

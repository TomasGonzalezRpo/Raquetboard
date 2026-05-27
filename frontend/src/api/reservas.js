import { api } from './client'

export const reservasAPI = {
  listar: (params = '') => api.get(`/reservas${params}`),
  crear: (data) => api.post('/reservas', data),
  actualizar: (id, data) => api.patch(`/reservas/${id}`, data),
  convertirClase: (id) => api.post(`/reservas/${id}/convertir-clase`),
}

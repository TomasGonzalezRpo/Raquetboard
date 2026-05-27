import { api } from './client'

export const inscripcionesAPI = {
  listar: (params = '') => api.get(`/inscripciones${params}`),
  crear: (data) => api.post('/inscripciones', data),
  resumen: (id) => api.get(`/inscripciones/${id}/resumen`),
}

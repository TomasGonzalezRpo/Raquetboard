import { api } from './client'

export const clasesAPI = {
  hoy: () => api.get('/clases/hoy'),
  listar: (params = '') => api.get(`/clases${params}`),
  registrar: (data) => api.post('/clases', data),
  actualizar: (id, data) => api.patch(`/clases/${id}`, data),
}

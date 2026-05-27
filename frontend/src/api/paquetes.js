import { api } from './client'

export const paquetesAPI = {
  listar: () => api.get('/paquetes'),
  crear: (data) => api.post('/paquetes', data),
  actualizar: (id, data) => api.patch(`/paquetes/${id}`, data),
}

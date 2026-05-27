import { api } from './client'

export const notificacionesAPI = {
  suscribir: (subscription) => api.post('/notificaciones/suscribir', subscription),
}

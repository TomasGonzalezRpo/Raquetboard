import { api } from './client'

export const authAPI = {
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

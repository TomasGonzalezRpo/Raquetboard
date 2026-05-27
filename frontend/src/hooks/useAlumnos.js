import { useState, useEffect } from 'react'
import { alumnosAPI } from '../api/alumnos'
import { cache } from '../utils/storage'

export function useAlumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async (forzar = false) => {
    if (!forzar) {
      const cached = cache.get('alumnos')
      if (cached) { setAlumnos(cached); setLoading(false); return }
    }
    try {
      setLoading(true)
      const data = await alumnosAPI.listar()
      setAlumnos(data)
      cache.set('alumnos', data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])
  return { alumnos, loading, error, recargar: () => cargar(true) }
}

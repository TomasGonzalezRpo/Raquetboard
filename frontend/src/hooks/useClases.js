import { useState, useEffect } from 'react'
import { clasesAPI } from '../api/clases'

export function useClasesHoy() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    clasesAPI.hoy()
      .then(setClases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { clases, loading, error }
}

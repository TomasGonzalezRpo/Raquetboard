export function formatFecha(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatHora(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

export function hoy() {
  return new Date().toISOString().split('T')[0]
}

export function diasHasta(dateStr) {
  const hoyDate = new Date()
  hoyDate.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((target - hoyDate) / (1000 * 60 * 60 * 24))
  return diff
}

export function formatDiasHasta(dateStr) {
  const dias = diasHasta(dateStr)
  if (dias < 0) return 'Vencido'
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return `Vence en ${dias} días`
}

export function nombreDia() {
  return new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

const PREFIX = 'raquetboard_'

export const cache = {
  set(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }))
    } catch {}
  },
  get(key, maxAgeMs = 5 * 60 * 1000) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > maxAgeMs) return null
      return data
    } catch {
      return null
    }
  },
  clear(key) {
    try { localStorage.removeItem(PREFIX + key) } catch {}
  },
}

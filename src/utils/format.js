const numberFormat = new Intl.NumberFormat('es-AR')

export const formatNumber = (value) => numberFormat.format(value ?? 0)

/** match de Last.fm (0 a 1) -> "87%" */
export const formatMatch = (match) => `${Math.min(100, Math.round((match ?? 0) * 100))}%`

/** "Daft Punk" -> "DP" · "Radiohead" -> "R" */
export function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = Array.from(words[0])[0]
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ''
  return (first + last).toUpperCase()
}

/** Hash estable de un texto (para elegir siempre el mismo color de fondo). */
export function hashString(text = '') {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  return hash
}

// Interpreta un texto libre ("domingo de lluvia, con mate y nostalgia, sin reggaetón") y devuelve lo que reconoce.
// Es una función pura: no usa la red. Para mejorarla con IA más adelante alcanza con reemplazar
// `interpretMood` por una versión que llame a una función de servidor y devuelva el mismo formato.
//
// Hay dos tipos de cosas reconocidas:
//  - moods (sentimientos, momentos, épocas): orientan la playlist.
//  - géneros: se RESPETAN AL 100% (la playlist solo lleva canciones de ese género).
// Un género negado ("sin reggaetón", "nada de trap") pasa a la lista de géneros a evitar.
import { MOODS } from '../data/moods.js'

const MAX_SOFT_MOODS = 4
const MAX_GENRES = 3
const NEGATION_WINDOW = 3
const MASK_CHAR = '§'
const MASK = /^§+$/

/** Palabras que niegan lo que viene después. "nada" solo cuenta en "nada de …". */
const NEGATIONS = new Set(['no', 'sin', 'ni', 'nunca', 'tampoco', 'evitar', 'evito', 'odio', 'detesto', 'not', 'dont', 'without'])
/** Palabras que cortan la negación: "no quiero tristeza pero sí rock" → rock no está negado. */
const CLAUSE_BREAKS = new Set(['pero', 'aunque', 'y', 'e', 'sino', 'si', 'but'])

/** Minúsculas, sin tildes ni signos, espacios simples. "¡Estoy FELIZ!" -> "estoy feliz" */
export function normalizeText(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9&\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "trist*" -> /(^| )trist\w*(?= |$)/ ; "buen humor" -> /(^| )buen humor(?= |$)/ */
function compileKeyword(keyword) {
  const prefix = keyword.endsWith('*')
  const base = normalizeText(prefix ? keyword.slice(0, -1) : keyword)
  return { length: base.length, regex: new RegExp(`(?:^| )${escapeRegExp(base)}${prefix ? '\\w*' : ''}(?= |$)`, 'g') }
}

// Se compila una sola vez al cargar el módulo
const SOFT = MOODS.filter((mood) => mood.kind !== 'genre').map((mood) => ({
  mood,
  patterns: mood.keywords.map(compileKeyword).map((pattern) => pattern.regex),
}))

// Géneros: una entrada por palabra clave, de la más larga a la más corta, para que "indie pop" gane sobre "indie" y "pop"
const GENRE_KEYWORDS = MOODS.filter((mood) => mood.kind === 'genre')
  .flatMap((mood) => mood.keywords.map((keyword) => ({ mood, ...compileKeyword(keyword) })))
  .sort((a, b) => b.length - a.length)

/** ¿Hay una negación justo antes de la palabra que empieza en `index`? ("no estoy triste", "nada de trap") */
function isNegated(text, index) {
  const before = text.slice(0, index).split(' ').filter(Boolean)
  for (let back = 1; back <= NEGATION_WINDOW && back <= before.length; back += 1) {
    const word = before[before.length - back]
    const next = before[before.length - back + 1] ?? null
    const previous = before[before.length - back - 1] ?? null
    if (NEGATIONS.has(word)) return true
    if (word === 'nada' && next === 'de') return true
    // "sin reggaetón y trap": la "y" sigue una lista ya negada, no abre una frase nueva
    if (CLAUSE_BREAKS.has(word)) {
      if (previous && MASK.test(previous)) continue
      return false
    }
  }
  return false
}

const startOf = (match) => match.index + (match[0].startsWith(' ') ? 1 : 0)
const toResult = (mood, score) => ({ id: mood.id, label: mood.label, kind: mood.kind, tags: mood.tags, score })

/**
 * @param {string} text
 * @returns {{
 *   moods: Array<{ id, label, kind, tags, score }>,         géneros primero, después moods por relevancia
 *   excludedGenres: Array<{ id, label, kind, tags, score }>, géneros que el texto pide evitar
 *   normalized: string,
 * }}
 */
export function interpretMood(text) {
  const normalized = normalizeText(text)
  if (!normalized) return { moods: [], excludedGenres: [], normalized }

  // 1) Géneros, de la frase más larga a la más corta. Lo reconocido se tapa con § para
  //    que sus palabras no se vuelvan a leer ("indie pop" no suma además "pop").
  let work = normalized
  const genreScores = new Map()
  const excluded = new Map()
  for (const { mood, regex } of GENRE_KEYWORDS) {
    regex.lastIndex = 0
    for (const match of [...work.matchAll(regex)]) {
      const start = startOf(match)
      const target = isNegated(work, start) ? excluded : genreScores
      target.set(mood.id, { mood, score: (target.get(mood.id)?.score ?? 0) + 1 })
      const length = match[0].trim().length
      work = `${work.slice(0, start)}${MASK_CHAR.repeat(length)}${work.slice(start + length)}`
    }
  }

  // 2) Moods sobre el texto que quedó
  const soft = []
  for (const { mood, patterns } of SOFT) {
    let score = 0
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      for (const match of work.matchAll(pattern)) if (!isNegated(work, startOf(match))) score += 1
    }
    if (score > 0) soft.push(toResult(mood, score))
  }

  const genres = [...genreScores.values()]
    .map(({ mood, score }) => toResult(mood, score))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_GENRES)
  const excludedGenres = [...excluded.values()]
    .filter(({ mood }) => !genreScores.has(mood.id))
    .map(({ mood, score }) => toResult(mood, score))

  soft.sort((a, b) => b.score - a.score)
  return { moods: [...genres, ...soft.slice(0, MAX_SOFT_MOODS)], excludedGenres, normalized }
}

/** Tags de Last.fm de los moods (no géneros): los dos primeros de cada uno, sin repetir. */
export function tagsForMoods(moods) {
  const tags = []
  for (const mood of moods) {
    if (mood.kind === 'genre') continue
    for (const tag of mood.tags.slice(0, 2)) if (!tags.includes(tag)) tags.push(tag)
  }
  return tags
}

/** Tags de Last.fm de los géneros (todos los sinónimos, porque son el mismo género). */
export function tagsForGenres(genres) {
  const tags = []
  for (const genre of genres) {
    for (const tag of genre.tags) if (!tags.includes(tag)) tags.push(tag)
  }
  return tags
}

/** Nombre sugerido para la playlist: "Mood · Hyperpop + Día de lluvia" (el género va primero) */
export function playlistNameForMoods(moods) {
  const ordered = [...moods].sort((a, b) => Number(b.kind === 'genre') - Number(a.kind === 'genre'))
  const labels = ordered.slice(0, 3).map((mood) => mood.label)
  return labels.length ? `Mood · ${labels.join(' + ')}` : 'Mi mood'
}

/** Género creado a partir de un tag de Last.fm que el usuario escribió (no está en el vocabulario). */
export function customGenre(tag) {
  const clean = String(tag).trim().replace(/\s+/g, ' ')
  const lower = clean.toLowerCase()
  return { id: `tag:${lower}`, label: clean.charAt(0).toUpperCase() + clean.slice(1), kind: 'genre', tags: [lower], score: 0 }
}

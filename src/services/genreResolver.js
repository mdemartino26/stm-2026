// Convierte lo que escribe el usuario ("hyperpop", "Shoegaze") en un género listo para usar.
// 1) Si está en el vocabulario (data/genres.js), se usa tal cual.
// 2) Si no, se le pregunta a Last.fm si el tag existe y es usado por suficiente gente.
import * as lastfm from './lastfm.js'
import { customGenre, interpretMood } from './moodInterpreter.js'

/** Mínimo de usuarios de Last.fm que usaron el tag para considerarlo un género real. */
const MIN_REACH = 50

/**
 * @returns {Promise<{ id, label, kind: 'genre', tags: string[] }>}
 * @throws {Error} con un mensaje para mostrar si no se reconoce el género
 */
export async function resolveGenre(text, { signal } = {}) {
  const clean = String(text ?? '').trim()
  if (clean.length < 2) throw new Error('Escribí el nombre de un género.')

  const { moods, excludedGenres } = interpretMood(clean)
  const known = moods.find((mood) => mood.kind === 'genre') ?? excludedGenres[0]
  if (known) return { id: known.id, label: known.label, kind: 'genre', tags: known.tags }

  const info = await lastfm.getTagInfo(clean, { signal })
  if (!info || info.reach < MIN_REACH) {
    throw new Error(`No encontramos “${clean}” como género en Last.fm. Revisá cómo está escrito.`)
  }
  const { id, label, kind, tags } = customGenre(info.name)
  return { id, label, kind, tags }
}

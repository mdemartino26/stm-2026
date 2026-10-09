// Portadas e imágenes de artistas.
// Last.fm ya no entrega imágenes reales, así que se buscan en Spotify de a poco:
// con cache (memoria + localStorage), sin pedidos duplicados y con un tope de 3 simultáneos.
import { STORAGE_KEYS } from '../config/constants.js'
import { createLimiter } from '../utils/limiter.js'
import { local } from '../utils/storage.js'
import { findArtistImage, findTrackImage } from './spotifyApi.js'
import { hasSession } from './spotifyAuth.js'

const MAX_PERSISTED = 400
const BLOCK_MS = 30_000

const memory = new Map(Object.entries(local.getJson(STORAGE_KEYS.artworkCache, {})))
const inflight = new Map()
const limit = createLimiter(3)
let blockedUntil = 0
let persistTimer = null

const normalize = (text = '') => text.toLowerCase().trim()

export const artworkKey = (kind, name, artist = '') => `${kind}|${normalize(name)}|${normalize(artist)}`

/** Lectura síncrona del cache (evita parpadeos al volver a renderizar). */
export const peekArtwork = (kind, name, artist = '') => memory.get(artworkKey(kind, name, artist)) ?? null

function schedulePersist() {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    const entries = [...memory.entries()].slice(-MAX_PERSISTED)
    local.setJson(STORAGE_KEYS.artworkCache, Object.fromEntries(entries))
  }, 500)
}

export function getArtwork(kind, name, artist = '') {
  const key = artworkKey(kind, name, artist)
  if (memory.has(key)) return Promise.resolve(memory.get(key))
  if (!hasSession() || Date.now() < blockedUntil) return Promise.resolve(null)
  if (inflight.has(key)) return inflight.get(key)

  const request = limit(() => (kind === 'artist' ? findArtistImage(name) : findTrackImage(name, artist)))
    .then((url) => {
      memory.set(key, url ?? null)
      schedulePersist()
      return url ?? null
    })
    .catch((error) => {
      // Sesión vencida, cuenta sin permiso o demasiados pedidos: se pausa un rato para no insistir.
      if ([401, 403, 429].includes(error?.status)) blockedUntil = Date.now() + BLOCK_MS
      return null
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, request)
  return request
}

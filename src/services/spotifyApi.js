// Cliente de la Web API de Spotify.
//
// IMPORTANTE (cambios de febrero de 2026 para apps en Development Mode):
//   · GET /search: limit máximo 10 (por defecto 5) -> se pagina con offset.
//   · Crear playlist: POST /me/playlists            (antes /users/{id}/playlists)
//   · Agregar canciones: POST /playlists/{id}/items  (antes /playlists/{id}/tracks)
//   · Siguen removidos: related-artists, recomendaciones y audio-features. Por eso los
//     "similares" salen de Last.fm y Spotify se usa para buscar, portadas y playlists.
// Guía oficial: https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
import { ApiError, requestJson } from './http.js'
import { endSession, getValidAccessToken } from './spotifyAuth.js'

const API_URL = 'https://api.spotify.com/v1'
const SEARCH_PAGE_SIZE = 10
const PLAYLIST_ITEMS_CHUNK = 100

async function spotifyFetch(path, { method = 'GET', params, body, signal } = {}) {
  const token = await getValidAccessToken()
  if (!token) throw new ApiError('No hay una sesión de Spotify activa.', { status: 401, service: 'spotify' })

  try {
    return await requestJson(`${API_URL}${path}`, {
      method,
      params,
      signal,
      service: 'spotify',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : null),
      },
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) endSession('expired')
    throw error
  }
}

/* ----------------------------- Normalizadores ----------------------------- */

/** Spotify devuelve varias resoluciones: elige la más chica que supere `target` px. */
export function pickImage(images, target = 300) {
  if (!images?.length) return null
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  return (sorted.find((image) => (image.width ?? 0) >= target) ?? sorted[sorted.length - 1]).url
}

export function normalizeSpotifyArtist(artist) {
  return {
    id: artist.id,
    type: 'artist',
    name: artist.name,
    image: pickImage(artist.images),
    genres: artist.genres ?? [],
    url: artist.external_urls?.spotify ?? null,
    source: 'spotify',
  }
}

export function normalizeSpotifyTrack(track) {
  const artists = track.artists?.map((artist) => artist.name) ?? []
  return {
    id: track.id,
    type: 'track',
    name: track.name,
    artist: artists.join(', '),
    primaryArtist: artists[0] ?? '',
    album: track.album?.name ?? '',
    image: pickImage(track.album?.images),
    uri: track.uri,
    url: track.external_urls?.spotify ?? null,
    source: 'spotify',
  }
}

const clean = (text = '') => text.replace(/["\\]/g, ' ').trim()

/* -------------------------------- Llamadas -------------------------------- */

export async function getMe(signal) {
  const me = await spotifyFetch('/me', { signal })
  return {
    id: me.id,
    displayName: me.display_name || me.id,
    image: pickImage(me.images, 64),
  }
}

/** Busca artistas o canciones. Pide `pages` páginas de 10 para devolver hasta 20 resultados. */
export async function searchSpotify({ type, query, pages = 2, signal }) {
  const responses = await Promise.all(
    Array.from({ length: pages }, (_, page) =>
      spotifyFetch('/search', {
        params: { q: query, type, limit: SEARCH_PAGE_SIZE, offset: page * SEARCH_PAGE_SIZE },
        signal,
      }),
    ),
  )
  const items = responses.flatMap((response) => response[type === 'artist' ? 'artists' : 'tracks']?.items ?? [])
  const normalize = type === 'artist' ? normalizeSpotifyArtist : normalizeSpotifyTrack
  const unique = new Map()
  for (const item of items.filter(Boolean)) {
    if (!unique.has(item.id)) unique.set(item.id, normalize(item))
  }
  return [...unique.values()]
}

export async function findArtistImage(name) {
  const response = await spotifyFetch('/search', {
    params: { q: `artist:"${clean(name)}"`, type: 'artist', limit: 1 },
  })
  const artist = response.artists?.items?.[0]
  return artist ? pickImage(artist.images) : null
}

/** Busca una canción puntual (para resolver su URI al armar una playlist). */
export async function findTrack(name, artist) {
  const response = await spotifyFetch('/search', {
    params: { q: `track:"${clean(name)}" artist:"${clean(artist)}"`, type: 'track', limit: 1 },
  })
  const track = response.tracks?.items?.[0]
  return track ? normalizeSpotifyTrack(track) : null
}

export async function findTrackImage(name, artist) {
  return (await findTrack(name, artist))?.image ?? null
}

export async function createPlaylist({ name, description = '' }) {
  const playlist = await spotifyFetch('/me/playlists', {
    method: 'POST',
    body: { name, description: description.slice(0, 300), public: false },
  })
  return { id: playlist.id, name: playlist.name, url: playlist.external_urls?.spotify ?? null }
}

export async function addItemsToPlaylist(playlistId, uris) {
  for (let start = 0; start < uris.length; start += PLAYLIST_ITEMS_CHUNK) {
    await spotifyFetch(`/playlists/${playlistId}/items`, {
      method: 'POST',
      body: { uris: uris.slice(start, start + PLAYLIST_ITEMS_CHUNK) },
    })
  }
}

// Guarda playlists en la cuenta de Spotify.
//
// 1. Last.fm propone las canciones (similares, de un mood o de una mezcla de artistas).
// 2. Cada canción se busca en Spotify para obtener su URI.
// 3. Se crea la playlist privada y se agregan las canciones encontradas.
import { mapLimit } from '../utils/limiter.js'
import * as lastfm from './lastfm.js'
import { addItemsToPlaylist, createPlaylist, findTrack } from './spotifyApi.js'

const TRACK_SEED_SIMILAR = 30
const ARTIST_SEED_SIMILAR = 20
const CONCURRENCY = 4
const FATAL_STATUSES = [401, 403, 429]

const dedupe = (tracks) => {
  const seen = new Set()
  return tracks.filter((track) => {
    const key = `${track.artist}|${track.name}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Lista de { name, artist } candidatas a entrar en la playlist. */
export async function collectCandidates(seed, signal) {
  if (seed.type === 'track') {
    const similar = await lastfm.getSimilarTracks(seed.artist, seed.name, { limit: TRACK_SEED_SIMILAR, signal })
    return dedupe([{ name: seed.name, artist: seed.artist }, ...similar])
  }

  const [ownTop, similarArtists] = await Promise.all([
    lastfm.getArtistTopTracks(seed.name, { limit: 2, signal }),
    lastfm.getSimilarArtists(seed.name, { limit: ARTIST_SEED_SIMILAR, signal }),
  ])
  const similarTops = await mapLimit(similarArtists, CONCURRENCY, async (artist) => {
    try {
      return await lastfm.getArtistTopTracks(artist.name, { limit: 1, signal })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      return [] // un artista sin datos no tiene que frenar toda la playlist
    }
  })
  return dedupe([...ownTop, ...similarTops.flat()])
}

/**
 * Busca cada canción en Spotify, crea la playlist privada y agrega las que encontró.
 * Sirve para cualquier lista de candidatas (similares, moods, mezcla de artistas).
 * @param {{ candidates: Array<{name:string, artist:string}>, name: string, description?: string,
 *           signal?: AbortSignal, onProgress?: (p:{phase:string, done?:number, total?:number}) => void }} options
 */
export async function savePlaylist({ candidates, name, description = '', signal, onProgress }) {
  if (!candidates?.length) throw new Error('No hay canciones para guardar.')

  let done = 0
  onProgress?.({ phase: 'matching', done, total: candidates.length })
  const matches = await mapLimit(candidates, CONCURRENCY, async (candidate) => {
    signal?.throwIfAborted()
    let match = null
    try {
      match = await findTrack(candidate.name, candidate.artist)
    } catch (error) {
      if (FATAL_STATUSES.includes(error?.status)) throw error
    }
    done += 1
    onProgress?.({ phase: 'matching', done, total: candidates.length })
    return match
  })

  const uris = [...new Set(matches.filter(Boolean).map((match) => match.uri))]
  if (uris.length === 0) throw new Error('No encontramos ninguna de esas canciones en Spotify.')

  signal?.throwIfAborted()
  onProgress?.({ phase: 'creating' })
  const playlist = await createPlaylist({ name, description })
  await addItemsToPlaylist(playlist.id, uris)

  return { playlist, added: uris.length, missing: candidates.length - uris.length }
}

/**
 * Playlist "similar a..." a partir de un artista o una canción.
 * @param {{ seed: {type:'artist'|'track', name:string, artist?:string}, name: string, description?: string,
 *           signal?: AbortSignal, onProgress?: (p:{phase:string, done?:number, total?:number}) => void }} options
 */
export async function buildSimilarPlaylist({ seed, name, description = '', signal, onProgress }) {
  onProgress?.({ phase: 'collecting' })
  const candidates = await collectCandidates(seed, signal)
  if (candidates.length === 0) throw new Error('Last.fm no tiene canciones similares para esto todavía.')
  return savePlaylist({ candidates, name, description, signal, onProgress })
}

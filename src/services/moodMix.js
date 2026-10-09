// Arma la lista de canciones candidatas (sin tocar Spotify) para las dos pantallas nuevas:
//  - collectMoodTracks: a partir de los tags de uno o más moods y, si hay, de géneros.
//  - collectArtistMixTracks: a partir del cruce de los similares de 2 o 3 artistas.
//
// Reglas:
//  - Un GÉNERO se respeta al 100%: si hay, todas las canciones son de ese género (el mood solo ordena).
//  - Los artistas y géneros A EVITAR se descartan siempre. Los géneros a evitar se resuelven con las listas
//    de Last.fm (las 100 canciones y los 100 artistas más representativos del género): cubre lo principal,
//    no es una garantía absoluta sobre todo el catálogo.
import { mapLimit } from '../utils/limiter.js'
import { interleave, mixTracks, trackKey } from '../utils/mixTracks.js'
import { rankForGenres } from '../utils/rankTracks.js'
import * as lastfm from './lastfm.js'

const CONCURRENCY = 4
const PREVIEW_SIZE = 25
const GENRE_PAGES = 3 // 150 canciones por género
const SOFT_PAGES = 2 // 100 canciones por tag de mood

const isAbort = (error) => error?.name === 'AbortError'

/** Una falla de red de un tag no frena al resto, salvo que se haya cancelado. */
async function orEmpty(promise) {
  try {
    return await promise
  } catch (error) {
    if (isAbort(error)) throw error
    return []
  }
}

/** Canciones de un tag, de la página 1 a `pages` (se corta cuando una página viene vacía). */
async function fetchTagPool(tag, pages, signal) {
  const tracks = []
  for (let page = 1; page <= pages; page += 1) {
    const chunk = await orEmpty(lastfm.getTagTopTracks(tag, { limit: 50, page, signal }))
    if (chunk.length === 0) break
    tracks.push(...chunk)
  }
  return tracks
}

/**
 * Función `accept(track)` que deja afuera a los artistas y géneros que el usuario no quiere escuchar.
 * @param {{ excludedGenreTags?: string[], excludedArtists?: string[], signal?: AbortSignal }} options
 */
export async function buildAccept({ excludedGenreTags = [], excludedArtists = [], signal } = {}) {
  const blockedArtists = new Set(excludedArtists.map((name) => name.toLowerCase()))
  const blockedTracks = new Set()

  await mapLimit(excludedGenreTags, CONCURRENCY, async (tag) => {
    const [tracks, artists] = await Promise.all([
      orEmpty(lastfm.getTagTopTracks(tag, { limit: 100, signal })),
      orEmpty(lastfm.getTagTopArtists(tag, { limit: 100, signal })),
    ])
    tracks.forEach((track) => blockedTracks.add(trackKey(track)))
    artists.forEach((name) => blockedArtists.add(name.toLowerCase()))
  })

  return (track) => !blockedArtists.has(track.artist.toLowerCase()) && !blockedTracks.has(trackKey(track))
}

/**
 * @param {{ moodTags?: string[], genreTags?: string[], excludedGenreTags?: string[], excludedArtists?: string[],
 *           seed?: number, signal?: AbortSignal }} options  `seed` distinto da otra tanda
 * @returns {Promise<{ tracks: Array<{name:string, artist:string}>, exactMatches: number }>}
 *   exactMatches: cuántas canciones son del género Y de un tag del mood (solo con género)
 */
export async function collectMoodTracks({
  moodTags = [],
  genreTags = [],
  excludedGenreTags = [],
  excludedArtists = [],
  seed = 0,
  signal,
} = {}) {
  // un género que el usuario también pidió evitar no entra
  const blocked = new Set(excludedGenreTags.map((tag) => tag.toLowerCase()))
  const wantedGenres = genreTags.filter((tag) => !blocked.has(tag.toLowerCase()))

  const [genrePools, softPools, accept] = await Promise.all([
    mapLimit(wantedGenres, CONCURRENCY, (tag) => fetchTagPool(tag, GENRE_PAGES, signal)),
    mapLimit(moodTags, CONCURRENCY, (tag) => fetchTagPool(tag, SOFT_PAGES, signal)),
    buildAccept({ excludedGenreTags, excludedArtists, signal }),
  ])

  if (wantedGenres.length > 0) {
    const { ranked, exact } = rankForGenres(genrePools, softPools)
    const tracks = mixTracks([ranked], { max: PREVIEW_SIZE, perArtist: 2, seed, headSize: 60, accept })
    return { tracks, exactMatches: tracks.filter((track) => exact.has(trackKey(track))).length }
  }

  const tracks = mixTracks(softPools, { max: PREVIEW_SIZE, perArtist: 2, seed, headSize: 50, accept })
  return { tracks, exactMatches: 0 }
}

/**
 * Puntúa artistas similares: los que aparecen en las listas de varios artistas elegidos ("puentes") pesan más.
 * Es pura para poder probarla. `lists` es un array de listas [{ name, match }] (una por artista elegido).
 */
export function rankBridgeArtists(seeds, lists, { size = 14 } = {}) {
  const seedKeys = new Set(seeds.map((name) => name.toLowerCase()))
  const scores = new Map()
  lists.forEach((list) => {
    list.forEach((artist) => {
      const key = artist.name.toLowerCase()
      if (seedKeys.has(key)) return
      const entry = scores.get(key) ?? { name: artist.name, score: 0, appearances: 0 }
      entry.score += artist.match ?? 0
      entry.appearances += 1
      scores.set(key, entry)
    })
  })
  return [...scores.values()]
    .map((entry) => ({ ...entry, score: entry.score * entry.appearances })) // aparecer en varias listas multiplica
    .sort((a, b) => b.score - a.score)
    .slice(0, size)
}

/**
 * @param {string[]} artists  2 o 3 nombres de artista (los elegidos nunca se descartan: los pidió el usuario)
 * @param {{ seed?: number, excludedGenreTags?: string[], excludedArtists?: string[], signal?: AbortSignal }} options
 * @returns {Promise<{ tracks: Array<{name,artist}>, bridges: string[] }>}  `bridges`: artistas que conectan a los elegidos
 */
export async function collectArtistMixTracks(artists, { seed = 0, excludedGenreTags = [], excludedArtists = [], signal } = {}) {
  const similarLists = await mapLimit(artists, CONCURRENCY, async (artist) => {
    try {
      return await lastfm.getSimilarArtists(artist, { limit: 30, signal })
    } catch (error) {
      if (isAbort(error)) throw error
      return []
    }
  })

  const seedKeys = new Set(artists.map((name) => name.toLowerCase()))
  const baseAccept = await buildAccept({ excludedGenreTags, excludedArtists, signal })
  const accept = (track) => seedKeys.has(track.artist.toLowerCase()) || baseAccept(track)

  const ranked = rankBridgeArtists(artists, similarLists, { size: 40 })
    .filter((entry) => accept({ name: '', artist: entry.name }))
    .slice(0, 14)
  const bridges = ranked.filter((entry) => entry.appearances > 1).map((entry) => entry.name)

  // Canciones: 2 de cada artista elegido y 1 de cada artista del cruce
  const targets = [...artists.map((name) => ({ name, limit: 2 })), ...ranked.map((entry) => ({ name: entry.name, limit: 1 }))]
  const tops = await mapLimit(targets, CONCURRENCY, async ({ name, limit }) => {
    try {
      return await lastfm.getArtistTopTracks(name, { limit, signal })
    } catch (error) {
      if (isAbort(error)) throw error
      return []
    }
  })

  // Un "pool" por artista elegido y otro con los del cruce: se intercalan para que se noten los tres mundos
  const seedPools = tops.slice(0, artists.length)
  const bridgePool = tops.slice(artists.length).flat()
  const tracks = mixTracks([...seedPools, bridgePool, bridgePool], { max: PREVIEW_SIZE, perArtist: 2, seed, accept })
  return { tracks, bridges }
}

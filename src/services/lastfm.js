// Cliente de la API de Last.fm (solo lectura, solo hace falta la API key: no hay secreto en el navegador).
// Docs: https://www.last.fm/api
import { LASTFM_API_KEY } from '../config/env.js'
import { ApiError, requestJson } from './http.js'

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

/* ----------------------------- Normalizadores -----------------------------
   Last.fm devuelve un objeto (no un array) cuando hay un solo resultado y
   strings en lugar de números. Estas funciones lo dejan prolijo y uniforme.
   Son puras y están cubiertas por tests. */

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])
const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const trackId = (artist, name) => `${artist}::${name}`

/** Artistas únicos de las últimas canciones, del más reciente al más viejo. */
export function normalizeRecentArtists(data, limit = 12) {
  const seen = new Set()
  const artists = []
  for (const track of toArray(data?.recenttracks?.track)) {
    const name = track?.artist?.['#text'] ?? track?.artist?.name
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    artists.push({
      id: name,
      type: 'artist',
      name,
      nowPlaying: track?.['@attr']?.nowplaying === 'true',
      lastTrack: track?.name ?? null,
      image: null,
    })
    if (artists.length >= limit) break
  }
  return artists
}

export function normalizeTopTracks(data) {
  return toArray(data?.toptracks?.track).map((track, index) => {
    const artist = track?.artist?.name ?? ''
    return {
      id: trackId(artist, track.name),
      type: 'track',
      name: track.name,
      artist,
      primaryArtist: artist,
      playcount: toNumber(track.playcount),
      rank: toNumber(track?.['@attr']?.rank, index + 1),
      image: null,
    }
  })
}

export function normalizeSimilarArtists(data) {
  return toArray(data?.similarartists?.artist).map((artist) => ({
    id: artist.name,
    type: 'artist',
    name: artist.name,
    match: toNumber(artist.match),
    image: null,
  }))
}

export function normalizeSimilarTracks(data) {
  return toArray(data?.similartracks?.track).map((track) => {
    const artist = track?.artist?.name ?? ''
    return {
      id: trackId(artist, track.name),
      type: 'track',
      name: track.name,
      artist,
      primaryArtist: artist,
      match: toNumber(track.match),
      image: null,
    }
  })
}

export function normalizeArtistTopTracks(data) {
  return toArray(data?.toptracks?.track).map((track) => ({
    name: track.name,
    artist: track?.artist?.name ?? '',
  }))
}

/** tag.getTopTracks: la raíz es "tracks" en JSON ("toptracks" en el XML de la documentación); se aceptan las dos. */
export function normalizeTagTopTracks(data) {
  const list = toArray(data?.tracks?.track ?? data?.toptracks?.track)
  return list
    .map((track) => ({ name: track?.name, artist: track?.artist?.name ?? '' }))
    .filter((track) => track.name && track.artist)
}

export function normalizeTagTopArtists(data) {
  return toArray(data?.topartists?.artist)
    .map((artist) => artist?.name)
    .filter(Boolean)
}

/** tag.getInfo: la popularidad del tag ("reach" = usuarios que lo usaron). Sirve para saber si un género existe. */
export function normalizeTagInfo(data) {
  const tag = data?.tag
  if (!tag?.name) return null
  return { name: tag.name, reach: toNumber(tag.reach ?? tag.taggings ?? tag.total) }
}

export function normalizeArtistSearch(data) {
  return toArray(data?.results?.artistmatches?.artist).map((artist) => ({
    id: artist.name,
    type: 'artist',
    name: artist.name,
    listeners: toNumber(artist.listeners),
    image: null,
    source: 'lastfm',
  }))
}

export function normalizeTrackSearch(data) {
  return toArray(data?.results?.trackmatches?.track).map((track) => ({
    id: trackId(track.artist, track.name),
    type: 'track',
    name: track.name,
    artist: track.artist ?? '',
    primaryArtist: track.artist ?? '',
    listeners: toNumber(track.listeners),
    image: null,
    source: 'lastfm',
  }))
}

/* --------------------------------- Llamadas --------------------------------- */

async function call(method, params, signal) {
  if (!LASTFM_API_KEY) {
    throw new ApiError('Falta la API key de Last.fm (VITE_LASTFM_API_KEY).', {
      service: 'lastfm',
      code: 10,
    })
  }
  const data = await requestJson(BASE_URL, {
    params: { method, api_key: LASTFM_API_KEY, format: 'json', ...params },
    signal,
    service: 'lastfm',
  })
  // Last.fm a veces responde 200 con { error, message }
  if (data?.error) {
    throw new ApiError(data.message ?? 'Error de Last.fm', {
      status: data.error === 6 ? 404 : 400,
      service: 'lastfm',
      code: data.error,
    })
  }
  return data
}

export async function getRecentArtists(user, { limit = 12, signal } = {}) {
  const data = await call('user.getRecentTracks', { user, limit: 100 }, signal)
  return normalizeRecentArtists(data, limit)
}

export async function getTopTracks(user, period, { limit = 20, signal } = {}) {
  const data = await call('user.getTopTracks', { user, period, limit }, signal)
  return normalizeTopTracks(data)
}

export async function getSimilarArtists(artist, { limit = 24, signal } = {}) {
  const data = await call('artist.getSimilar', { artist, limit, autocorrect: 1 }, signal)
  return normalizeSimilarArtists(data)
}

export async function getSimilarTracks(artist, track, { limit = 30, signal } = {}) {
  const data = await call('track.getSimilar', { artist, track, limit, autocorrect: 1 }, signal)
  return normalizeSimilarTracks(data)
}

export async function getArtistTopTracks(artist, { limit = 1, signal } = {}) {
  const data = await call('artist.getTopTracks', { artist, limit, autocorrect: 1 }, signal)
  return normalizeArtistTopTracks(data)
}

/** Canciones más representativas de un tag (un mood, un género, una época). */
export async function getTagTopTracks(tag, { limit = 50, page = 1, signal } = {}) {
  const data = await call('tag.getTopTracks', { tag, limit, page }, signal)
  return normalizeTagTopTracks(data)
}

export async function getTagTopArtists(tag, { limit = 100, signal } = {}) {
  const data = await call('tag.getTopArtists', { tag, limit }, signal)
  return normalizeTagTopArtists(data)
}

/** null si Last.fm no conoce el tag. */
export async function getTagInfo(tag, { signal } = {}) {
  try {
    return normalizeTagInfo(await call('tag.getInfo', { tag }, signal))
  } catch (error) {
    if (error?.status === 404 || error?.code === 6) return null
    throw error
  }
}

export async function searchArtists(query, { limit = 20, signal } = {}) {
  const data = await call('artist.search', { artist: query, limit }, signal)
  return normalizeArtistSearch(data)
}

export async function searchTracks(query, { limit = 20, signal } = {}) {
  const data = await call('track.search', { track: query, limit }, signal)
  return normalizeTrackSearch(data)
}

// Ordena canciones de un género según cuánto encajan con un mood.
// El género es la regla (solo salen canciones de él); el mood solo decide el orden.
import { interleave, trackKey } from './mixTracks.js'

/**
 * @param {Array<Array<{name, artist}>>} genrePools  canciones de cada género (o sinónimo), de mejor a peor
 * @param {Array<Array<{name, artist}>>} softPools   canciones de cada tag de mood
 * @returns {{ ranked: Array<{name, artist}>, exact: Set<string> }}
 *   ranked: SOLO canciones de los géneros, primero las que también están en los tags del mood,
 *           después las de artistas que aparecen en esos tags, y al final el resto.
 *   exact:  claves (trackKey) de las canciones que están en un género y en un tag de mood a la vez.
 */
export function rankForGenres(genrePools, softPools) {
  const candidates = interleave(genrePools)
  const trackHits = new Map()
  const artistHits = new Map()

  for (const pool of softPools) {
    const seenTracks = new Set()
    const seenArtists = new Set()
    for (const track of pool) {
      const key = trackKey(track)
      const artist = track.artist.toLowerCase()
      if (!seenTracks.has(key)) {
        seenTracks.add(key)
        trackHits.set(key, (trackHits.get(key) ?? 0) + 1)
      }
      if (!seenArtists.has(artist)) {
        seenArtists.add(artist)
        artistHits.set(artist, (artistHits.get(artist) ?? 0) + 1)
      }
    }
  }

  const total = candidates.length || 1
  const scored = candidates.map((track, index) => {
    const hits = trackHits.get(trackKey(track)) ?? 0
    const artist = artistHits.get(track.artist.toLowerCase()) ?? 0
    // coincidencia de canción pesa más que de artista; el orden original desempata
    return { track, hits, score: hits * 4 + Math.min(artist, 3) + (1 - index / total) }
  })
  scored.sort((a, b) => b.score - a.score)

  return {
    ranked: scored.map((item) => item.track),
    exact: new Set(scored.filter((item) => item.hits > 0).map((item) => trackKey(item.track))),
  }
}

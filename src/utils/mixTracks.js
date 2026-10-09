// Mezcla varias listas de canciones en una sola: intercala una de cada lista (así ningún mood domina),
// limita las canciones por artista y quita repetidas. Con `seed` distinto sale otra tanda.

/** Generador pseudoaleatorio determinístico (mulberry32): mismo seed, mismo orden. */
export function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled(items, random) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Identifica una canción sin importar mayúsculas: "artista|nombre". */
export const trackKey = (track) => `${track.artist}|${track.name}`.toLowerCase()
const keyOf = trackKey

/**
 * @param {Array<Array<{name:string, artist:string}>>} pools  listas de canciones, de mejor a peor
 * @param {{ max?: number, perArtist?: number, seed?: number, headSize?: number, accept?: (track) => boolean }} options
 *   accept: filtro opcional; las canciones que no lo cumplen se descartan (artistas o géneros a evitar)
 *   seed 0 -> respeta el orden de cada lista; seed > 0 -> mezcla las `headSize` primeras de cada una
 */
export function mixTracks(pools, { max = 25, perArtist = 2, seed = 0, headSize = 40, accept } = {}) {
  const random = createRandom(seed + 1)
  const queues = pools
    .map((pool) => (seed > 0 ? shuffled(pool.slice(0, headSize), random) : pool.slice(0, headSize)))
    .filter((queue) => queue.length > 0)

  const picked = []
  const seen = new Set()
  const perArtistCount = new Map()
  const cursors = queues.map(() => 0)

  let progressed = true
  while (picked.length < max && progressed) {
    progressed = false
    for (let q = 0; q < queues.length && picked.length < max; q += 1) {
      // avanza en esta lista hasta encontrar una canción que se pueda usar
      while (cursors[q] < queues[q].length) {
        const track = queues[q][cursors[q]]
        cursors[q] += 1
        progressed = true
        const key = keyOf(track)
        const artistKey = track.artist.toLowerCase()
        if (seen.has(key) || (perArtistCount.get(artistKey) ?? 0) >= perArtist) continue
        if (accept && !accept(track)) continue
        seen.add(key)
        perArtistCount.set(artistKey, (perArtistCount.get(artistKey) ?? 0) + 1)
        picked.push({ name: track.name, artist: track.artist })
        break
      }
    }
  }
  return picked
}

/** Une varias listas intercalándolas (una de cada una) y sin repetir canciones. No limita por artista. */
export function interleave(pools) {
  const seen = new Set()
  const result = []
  const longest = Math.max(0, ...pools.map((pool) => pool.length))
  for (let index = 0; index < longest; index += 1) {
    for (const pool of pools) {
      const track = pool[index]
      if (!track) continue
      const key = keyOf(track)
      if (seen.has(key)) continue
      seen.add(key)
      result.push(track)
    }
  }
  return result
}

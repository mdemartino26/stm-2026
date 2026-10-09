import { describe, expect, it } from 'vitest'
import { mixTracks } from './mixTracks.js'

const pool = (artist, count) => Array.from({ length: count }, (_, i) => ({ name: `${artist} ${i}`, artist }))

describe('mixTracks', () => {
  it('intercala una canción de cada lista', () => {
    const result = mixTracks([pool('A', 3), pool('B', 3)], { max: 4, perArtist: 5 })
    expect(result.map((t) => t.artist)).toEqual(['A', 'B', 'A', 'B'])
  })

  it('limita las canciones por artista y quita repetidas', () => {
    const repeated = [{ name: 'X', artist: 'A' }, { name: 'x', artist: 'a' }, ...pool('A', 5)]
    const result = mixTracks([repeated], { perArtist: 2 })
    expect(result).toHaveLength(2)
  })

  it('respeta el máximo y sigue con la otra lista cuando una se agota', () => {
    const result = mixTracks([pool('A', 1), pool('B', 5), pool('C', 5)], { max: 6, perArtist: 1 })
    expect(result.map((t) => t.artist)).toEqual(['A', 'B', 'C'])
  })

  it('con el mismo seed da el mismo resultado y con otro seed, otra tanda', () => {
    const pools = [pool('A', 30), pool('B', 30)]
    const first = mixTracks(pools, { max: 10, perArtist: 30, seed: 1 })
    expect(mixTracks(pools, { max: 10, perArtist: 30, seed: 1 })).toEqual(first)
    expect(mixTracks(pools, { max: 10, perArtist: 30, seed: 2 })).not.toEqual(first)
  })

  it('con lista vacía devuelve vacío', () => {
    expect(mixTracks([[], []])).toEqual([])
  })
})

describe('mixTracks con filtro', () => {
  it('descarta lo que no cumple accept y completa con otras canciones', () => {
    const accept = (track) => track.artist !== 'A'
    const result = mixTracks([pool('A', 5), pool('B', 5)], { max: 3, perArtist: 5, accept })
    expect(result.every((track) => track.artist === 'B')).toBe(true)
    expect(result).toHaveLength(3)
  })
})

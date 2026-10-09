import { describe, expect, it } from 'vitest'
import {
  normalizeArtistSearch,
  normalizeRecentArtists,
  normalizeSimilarArtists,
  normalizeSimilarTracks,
  normalizeTagInfo,
  normalizeTagTopArtists,
  normalizeTagTopTracks,
  normalizeTopTracks,
  normalizeTrackSearch,
} from './lastfm.js'

describe('normalizadores de Last.fm', () => {
  it('recentArtists: deduplica sin distinguir mayúsculas y respeta el orden y el límite', () => {
    const data = {
      recenttracks: {
        track: [
          { name: 'A', artist: { '#text': 'Radiohead' }, '@attr': { nowplaying: 'true' } },
          { name: 'B', artist: { '#text': 'radiohead' } },
          { name: 'C', artist: { '#text': 'Björk' } },
          { name: 'D', artist: { '#text': 'Portishead' } },
        ],
      },
    }
    const artists = normalizeRecentArtists(data, 2)
    expect(artists.map((a) => a.name)).toEqual(['Radiohead', 'Björk'])
    expect(artists[0].nowPlaying).toBe(true)
    expect(artists[1].nowPlaying).toBe(false)
  })

  it('tolera que Last.fm mande un objeto en lugar de un array', () => {
    const data = { recenttracks: { track: { name: 'A', artist: { '#text': 'Solo' } } } }
    expect(normalizeRecentArtists(data)).toHaveLength(1)
  })

  it('topTracks: convierte strings a números y arma el id', () => {
    const data = {
      toptracks: {
        track: [{ name: 'Creep', playcount: '42', artist: { name: 'Radiohead' }, '@attr': { rank: '1' } }],
      },
    }
    expect(normalizeTopTracks(data)).toEqual([
      {
        id: 'Radiohead::Creep',
        type: 'track',
        name: 'Creep',
        artist: 'Radiohead',
        primaryArtist: 'Radiohead',
        playcount: 42,
        rank: 1,
        image: null,
      },
    ])
  })

  it('similares: devuelve el match como número', () => {
    expect(normalizeSimilarArtists({ similarartists: { artist: [{ name: 'Portishead', match: '0.87' }] } })[0].match).toBe(0.87)
    const tracks = normalizeSimilarTracks({
      similartracks: { track: [{ name: 'Glory Box', match: 0.5, artist: { name: 'Portishead' } }] },
    })
    expect(tracks[0]).toMatchObject({ name: 'Glory Box', artist: 'Portishead', match: 0.5 })
  })

  it('búsquedas: marcan la fuente lastfm y no inventan imágenes', () => {
    const artists = normalizeArtistSearch({ results: { artistmatches: { artist: [{ name: 'Bjork', listeners: '10' }] } } })
    const tracks = normalizeTrackSearch({ results: { trackmatches: { track: [{ name: 'Army of Me', artist: 'Björk' }] } } })
    expect(artists[0]).toMatchObject({ source: 'lastfm', image: null, listeners: 10 })
    expect(tracks[0]).toMatchObject({ source: 'lastfm', primaryArtist: 'Björk' })
  })

  it('respuestas vacías no rompen', () => {
    expect(normalizeTopTracks({})).toEqual([])
    expect(normalizeSimilarArtists(undefined)).toEqual([])
  })

  it('tagTopTracks: acepta la raíz "tracks" o "toptracks" y descarta items sin artista', () => {
    const track = [{ name: 'Creep', artist: { name: 'Radiohead' } }, { name: 'Huérfana', artist: {} }]
    expect(normalizeTagTopTracks({ tracks: { track } })).toEqual([{ name: 'Creep', artist: 'Radiohead' }])
    expect(normalizeTagTopTracks({ toptracks: { track: track[0] } })).toEqual([{ name: 'Creep', artist: 'Radiohead' }])
    expect(normalizeTagTopTracks({})).toEqual([])
  })

  it('tagTopArtists y tagInfo: normalizan nombres y popularidad', () => {
    expect(normalizeTagTopArtists({ topartists: { artist: [{ name: 'A' }, { name: 'B' }, {}] } })).toEqual(['A', 'B'])
    expect(normalizeTagTopArtists({})).toEqual([])
    expect(normalizeTagInfo({ tag: { name: 'hyperpop', reach: '5000' } })).toEqual({ name: 'hyperpop', reach: 5000 })
    expect(normalizeTagInfo({ tag: { name: 'x', taggings: 7 } })).toEqual({ name: 'x', reach: 7 })
    expect(normalizeTagInfo({})).toBeNull()
  })
})

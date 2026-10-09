import { describe, expect, it } from 'vitest'
import { rankBridgeArtists } from './moodMix.js'

describe('rankBridgeArtists', () => {
  const lists = [
    [{ name: 'Puente', match: 0.5 }, { name: 'Solo de A', match: 0.9 }, { name: 'Radiohead', match: 1 }],
    [{ name: 'puente', match: 0.4 }, { name: 'Solo de B', match: 0.3 }],
  ]

  it('prioriza a los artistas que aparecen en varias listas', () => {
    const ranked = rankBridgeArtists(['Radiohead', 'Muse'], lists)
    expect(ranked[0]).toMatchObject({ name: 'Puente', appearances: 2 })
  })

  it('no incluye a los artistas elegidos', () => {
    const ranked = rankBridgeArtists(['Radiohead'], lists)
    expect(ranked.map((r) => r.name)).not.toContain('Radiohead')
  })

  it('respeta el tamaño', () => {
    expect(rankBridgeArtists([], lists, { size: 1 })).toHaveLength(1)
  })
})

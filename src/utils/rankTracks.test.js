import { describe, expect, it } from 'vitest'
import { trackKey } from './mixTracks.js'
import { rankForGenres } from './rankTracks.js'

const t = (name, artist) => ({ name, artist })

describe('rankForGenres', () => {
  const genre = [[t('G1', 'A'), t('G2', 'B'), t('G3', 'C'), t('G4', 'D')]]

  it('solo devuelve canciones del género, aunque el mood tenga otras', () => {
    const soft = [[t('Otra', 'Z'), t('G3', 'C')]]
    const { ranked } = rankForGenres(genre, soft)
    expect(ranked.map((x) => x.name).sort()).toEqual(['G1', 'G2', 'G3', 'G4'])
    expect(ranked.some((x) => x.name === 'Otra')).toBe(false)
  })

  it('pone primero las que también están en el mood y marca las exactas', () => {
    const { ranked, exact } = rankForGenres(genre, [[t('G3', 'C')]])
    expect(ranked[0].name).toBe('G3')
    expect(exact.has(trackKey(t('G3', 'C')))).toBe(true)
    expect(exact.size).toBe(1)
  })

  it('después prioriza a los artistas que aparecen en el mood', () => {
    const { ranked } = rankForGenres(genre, [[t('Otra canción', 'D')]])
    expect(ranked[0].name).toBe('G4')
  })

  it('sin mood respeta el orden del género', () => {
    expect(rankForGenres(genre, []).ranked.map((x) => x.name)).toEqual(['G1', 'G2', 'G3', 'G4'])
  })

  it('con varios géneros intercala y no repite', () => {
    const pools = [[t('X1', 'A'), t('X2', 'B')], [t('Y1', 'C'), t('X1', 'A')]]
    expect(rankForGenres(pools, []).ranked.map((x) => x.name)).toEqual(['X1', 'Y1', 'X2'])
  })
})

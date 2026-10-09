import { describe, expect, it } from 'vitest'
import { cn } from './cn.js'
import { initials } from './format.js'
import { similarPath } from './routes.js'

describe('utils', () => {
  it('cn descarta valores falsos', () => {
    expect(cn('a', false, null, undefined, '', 'b', [0, 'c'])).toBe('a b c')
  })

  it('initials arma las iniciales', () => {
    expect(initials('Daft Punk')).toBe('DP')
    expect(initials('Radiohead')).toBe('R')
    expect(initials('')).toBe('?')
  })

  it('similarPath codifica los parámetros', () => {
    expect(similarPath({ type: 'artist', name: 'Sigur Rós' })).toBe('/similares?type=artist&name=Sigur+R%C3%B3s')
    expect(similarPath({ type: 'track', name: 'Creep', artist: 'Radiohead' })).toBe(
      '/similares?type=track&name=Creep&artist=Radiohead',
    )
  })
})

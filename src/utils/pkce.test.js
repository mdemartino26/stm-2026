import { describe, expect, it } from 'vitest'
import { base64UrlEncode, codeChallenge, randomString } from './pkce.js'

describe('pkce', () => {
  it('calcula el code_challenge del vector de prueba de la RFC 7636', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    expect(await codeChallenge(verifier)).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
  })

  it('genera cadenas del largo pedido y solo con caracteres permitidos', () => {
    const value = randomString(96)
    expect(value).toHaveLength(96)
    expect(value).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('no repite valores', () => {
    expect(randomString(64)).not.toBe(randomString(64))
  })

  it('codifica en base64url sin relleno', () => {
    expect(base64UrlEncode(new Uint8Array([251, 255, 254]).buffer)).toBe('-__-')
  })
})

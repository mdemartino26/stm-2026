// Helpers de PKCE (RFC 7636). Usan la Web Crypto API, disponible en navegadores y en Node 20+.

// 64 caracteres exactos => (byte % 64) no introduce sesgo.
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/** Cadena aleatoria criptográficamente segura (sirve como code_verifier y como state). */
export function randomString(length = 64) {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (const byte of bytes) out += CHARSET[byte % CHARSET.length]
  return out
}

export function base64UrlEncode(buffer) {
  let binary = ''
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** code_challenge = BASE64URL(SHA-256(code_verifier)) */
export async function codeChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64UrlEncode(digest)
}

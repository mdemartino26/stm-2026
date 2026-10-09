// Login con Spotify mediante Authorization Code + PKCE (no requiere client secret).
// Docs: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
import { STORAGE_KEYS } from '../config/constants.js'
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI_OVERRIDE } from '../config/env.js'
import { codeChallenge, randomString } from '../utils/pkce.js'
import { local, session } from '../utils/storage.js'
import { ApiError, requestJson } from './http.js'

const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const EXPIRY_MARGIN_MS = 60_000

// Mínimo privilegio: solo hace falta poder crear playlists privadas.
export const SCOPES = ['playlist-modify-private']

/** Evento que se dispara cuando la sesión termina (logout o token vencido). */
export const SESSION_ENDED_EVENT = 'stm:session-ended'

/** Spotify exige que coincida EXACTO con una Redirect URI registrada en el dashboard. */
export const getRedirectUri = () =>
  SPOTIFY_REDIRECT_URI_OVERRIDE || `${window.location.origin}/callback`

export const isConfigured = () => Boolean(SPOTIFY_CLIENT_ID)

const readSession = () => local.getJson(STORAGE_KEYS.session, null)

export const hasSession = () => Boolean(readSession()?.accessToken)

function saveSession(token, previous = null) {
  const next = {
    accessToken: token.access_token,
    // En el refresh Spotify puede no mandar un refresh_token nuevo: se conserva el anterior.
    refreshToken: token.refresh_token ?? previous?.refreshToken ?? null,
    expiresAt: Date.now() + token.expires_in * 1000,
    scope: token.scope ?? previous?.scope ?? '',
  }
  local.setJson(STORAGE_KEYS.session, next)
  return next
}

/** Borra la sesión y avisa a la app. */
export function endSession(reason = 'logout') {
  local.remove(STORAGE_KEYS.session)
  local.remove(STORAGE_KEYS.profile)
  window.dispatchEvent(new CustomEvent(SESSION_ENDED_EVENT, { detail: { reason } }))
}

const requestToken = (fields) =>
  requestJson(TOKEN_URL, {
    method: 'POST',
    // fetch agrega solo el Content-Type application/x-www-form-urlencoded
    body: new URLSearchParams({ client_id: SPOTIFY_CLIENT_ID, ...fields }),
    service: 'spotify',
  })

/** Paso 1: genera verifier + challenge y manda a la persona a Spotify. */
export async function startLogin() {
  if (!isConfigured()) {
    throw new Error('Falta VITE_SPOTIFY_CLIENT_ID. Copiá .env.example a .env y completalo.')
  }
  const verifier = randomString(96)
  const state = randomString(24) // protege contra CSRF
  session.set(STORAGE_KEYS.pkceVerifier, verifier)
  session.set(STORAGE_KEYS.pkceState, state)

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: await codeChallenge(verifier),
    state,
  })
  window.location.assign(`${AUTHORIZE_URL}?${params.toString()}`)
}

/** Paso 2: Spotify vuelve a /callback?code=...&state=... y se cambia el code por tokens. */
async function completeLogin(searchParams) {
  const error = searchParams.get('error')
  if (error) {
    throw new Error(
      error === 'access_denied' ? 'Cancelaste el acceso a Spotify.' : `Spotify devolvió un error: ${error}`,
    )
  }
  const code = searchParams.get('code')
  if (!code) throw new Error('Falta el código de autorización en la URL.')

  const expectedState = session.get(STORAGE_KEYS.pkceState)
  if (!expectedState || searchParams.get('state') !== expectedState) {
    throw new Error('El estado de la sesión no coincide. Volvé a intentar el ingreso.')
  }
  const verifier = session.get(STORAGE_KEYS.pkceVerifier)
  if (!verifier) throw new Error('No encontramos el verificador PKCE. Volvé a intentar el ingreso.')

  const token = await requestToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  })
  saveSession(token)
  session.remove(STORAGE_KEYS.pkceVerifier)
  session.remove(STORAGE_KEYS.pkceState)
}

// React.StrictMode ejecuta los efectos dos veces en desarrollo y un `code` solo sirve una vez.
// Memorizar la promesa por code evita el segundo intercambio.
const attempts = new Map()
export function completeLoginOnce(searchParams) {
  const key = searchParams.get('code') ?? searchParams.get('error') ?? 'empty'
  if (!attempts.has(key)) attempts.set(key, completeLogin(searchParams))
  return attempts.get(key)
}

let refreshing = null

async function refresh(current) {
  try {
    const token = await requestToken({ grant_type: 'refresh_token', refresh_token: current.refreshToken })
    return saveSession(token, current).accessToken
  } catch (error) {
    // Solo se cierra la sesión si Spotify rechazó el refresh_token; un corte de red no la invalida.
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      endSession('expired')
      return null
    }
    throw error
  }
}

/** Devuelve un access token vigente (lo renueva si está por vencer) o null si no hay sesión. */
export async function getValidAccessToken() {
  const current = readSession()
  if (!current?.accessToken) return null
  if (Date.now() < current.expiresAt - EXPIRY_MARGIN_MS) return current.accessToken
  if (!current.refreshToken) {
    endSession('expired')
    return null
  }
  refreshing ??= refresh(current).finally(() => {
    refreshing = null
  })
  return refreshing
}

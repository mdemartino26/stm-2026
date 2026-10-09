import { useCallback, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../config/constants.js'
import { useSnackbar } from '../hooks/useSnackbar.js'
import { getMe } from '../services/spotifyApi.js'
import {
  SESSION_ENDED_EVENT,
  completeLoginOnce,
  endSession,
  hasSession,
  startLogin,
} from '../services/spotifyAuth.js'
import { friendlyError } from '../utils/errors.js'
import { local, session } from '../utils/storage.js'
import { AuthContext } from './authContext.js'

function readInitialStatus() {
  if (hasSession()) return 'authenticated'
  if (session.get(STORAGE_KEYS.demo) === '1') return 'demo'
  return 'anonymous'
}

export default function AuthProvider({ children }) {
  const { show } = useSnackbar()
  const [status, setStatus] = useState(readInitialStatus)
  const [profile, setProfile] = useState(() => local.getJson(STORAGE_KEYS.profile, null))

  // La sesión puede terminar desde cualquier parte (token vencido, 401 de la API, logout).
  useEffect(() => {
    const onEnded = (event) => {
      setProfile(null)
      setStatus((current) => (current === 'authenticated' ? 'anonymous' : current))
      if (event.detail?.reason === 'expired') show('Tu sesión de Spotify expiró. Ingresá de nuevo.')
    }
    window.addEventListener(SESSION_ENDED_EVENT, onEnded)
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnded)
  }, [show])

  // Nombre y foto para la barra superior. Si falla no es grave: se usa un nombre genérico.
  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    getMe()
      .then((me) => {
        if (cancelled) return
        setProfile(me)
        local.setJson(STORAGE_KEYS.profile, me)
      })
      .catch((error) => {
        if (!cancelled && error?.status === 403) show(friendlyError(error), { duration: 8000 })
      })
    return () => {
      cancelled = true
    }
  }, [status, show])

  const login = useCallback(() => startLogin(), [])

  const completeLogin = useCallback(async (searchParams) => {
    await completeLoginOnce(searchParams)
    setStatus('authenticated')
  }, [])

  const enterDemo = useCallback(() => {
    session.set(STORAGE_KEYS.demo, '1')
    setStatus('demo')
  }, [])

  const logout = useCallback(() => {
    session.remove(STORAGE_KEYS.demo)
    endSession('logout')
    setProfile(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({
      status,
      isAuthenticated: status === 'authenticated',
      isDemo: status === 'demo',
      profile,
      login,
      completeLogin,
      enterDemo,
      logout,
    }),
    [status, profile, login, completeLogin, enterDemo, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

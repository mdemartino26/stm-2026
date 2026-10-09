import { useCallback, useState } from 'react'
import { friendlyError } from '../utils/errors.js'
import { useAuth } from './useAuth.js'
import { useSnackbar } from './useSnackbar.js'

/**
 * Inicia el login con Spotify y avisa con un snackbar si algo falla (por ejemplo, falta el Client ID).
 *   const { login, loading } = useLogin()
 *   <Button loading={loading} onClick={login}>Ingresá</Button>
 */
export default function useLogin() {
  const { login } = useAuth()
  const { show } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const start = useCallback(async () => {
    setLoading(true)
    try {
      await login() // la página se redirige a Spotify, así que `loading` queda activo hasta salir
    } catch (error) {
      setLoading(false)
      show(friendlyError(error), { duration: 8000 })
    }
  }, [login, show])

  return { login: start, loading }
}

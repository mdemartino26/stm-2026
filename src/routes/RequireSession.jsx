import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

/** Deja pasar solo si hay sesión de Spotify o modo demo; si no, vuelve a la portada. */
export default function RequireSession({ children }) {
  const { status } = useAuth()
  if (status === 'anonymous') return <Navigate to="/" replace />
  return children
}

import { createContext } from 'react'

/**
 * Estado de autenticación de la app.
 *   status: 'anonymous' | 'authenticated' (Spotify) | 'demo' (sin cuenta)
 */
export const AuthContext = createContext(null)

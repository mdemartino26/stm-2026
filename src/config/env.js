// Único lugar donde se leen las variables de entorno de Vite (VITE_*).
const env = import.meta.env

export const SPOTIFY_CLIENT_ID = env.VITE_SPOTIFY_CLIENT_ID ?? ''
export const SPOTIFY_REDIRECT_URI_OVERRIDE = env.VITE_SPOTIFY_REDIRECT_URI ?? ''
export const LASTFM_API_KEY = env.VITE_LASTFM_API_KEY ?? ''
export const DEMO_LASTFM_USER = env.VITE_DEMO_LASTFM_USER || 'rj'

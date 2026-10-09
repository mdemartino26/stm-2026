/** Claves de almacenamiento del navegador (todas con el prefijo "stm."). */
export const STORAGE_KEYS = {
  session: 'stm.session',
  demo: 'stm.demo',
  profile: 'stm.profile',
  lastfmUser: 'stm.lastfmUser',
  artworkCache: 'stm.artwork.v1',
  pkceVerifier: 'stm.pkce.verifier',
  pkceState: 'stm.pkce.state',
  filters: 'stm.filters',
  moodForm: 'stm.mood.form', // sessionStorage: lo que el usuario escribió y armó en Set the mood
  mixForm: 'stm.mix.form', // sessionStorage: artistas elegidos y playlist armada en Mezclar
}

/** Períodos que acepta Last.fm en user.getTopTracks. */
export const PERIODS = [
  { value: '7day', label: '7 días' },
  { value: '1month', label: '1 mes' },
  { value: '3month', label: '3 meses' },
  { value: '6month', label: '6 meses' },
  { value: '12month', label: '12 meses' },
  { value: 'overall', label: 'Siempre' },
]

export const DEFAULT_PERIOD = '1month'

/** Pantalla a la que se llega al ingresar. */
export const HOME_PATH = '/mood'

/** Destinos de la barra de navegación (barra inferior en compact, rail desde medium). */
export const NAV_ITEMS = [
  { to: '/mood', label: 'Mood', icon: 'mood', match: ['/mood'] },
  { to: '/mezclar', label: 'Mezclar', icon: 'shuffle', match: ['/mezclar'] },
  { to: '/buscar', label: 'Descubrir', icon: 'explore', match: ['/buscar', '/similares'] },
  { to: '/dashboard', label: 'Mi música', icon: 'dashboard', match: ['/dashboard'] },
]

export const SEARCH_TYPES = [
  { value: 'artist', label: 'Artistas', icon: 'person' },
  { value: 'track', label: 'Canciones', icon: 'musicNote' },
]

export const SPOTIFY_SIGNUP_URL = 'https://www.spotify.com/signup'

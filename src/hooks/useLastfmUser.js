import { STORAGE_KEYS } from '../config/constants.js'
import { DEMO_LASTFM_USER } from '../config/env.js'
import useLocalStorage from './useLocalStorage.js'

/**
 * Usuario de Last.fm cuyo historial se muestra en el dashboard.
 * Last.fm no permite login desde el navegador sin un servidor (la firma necesita el "shared secret"),
 * pero los perfiles públicos se leen solo con la API key. Por eso la persona indica su usuario.
 * En modo demo arranca con un usuario público de ejemplo.
 */
export default function useLastfmUser(isDemo) {
  const [stored, setStored] = useLocalStorage(STORAGE_KEYS.lastfmUser, '')
  const username = stored || (isDemo ? DEMO_LASTFM_USER : '')
  return [username, setStored]
}

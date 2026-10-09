import { ApiError } from '../services/http.js'

/** Traduce cualquier error a un mensaje claro para mostrarle a la persona. */
export function friendlyError(error) {
  if (!error) return 'Ocurrió un error inesperado.'

  if (error instanceof ApiError) {
    const { service, status, code } = error

    if (service === 'lastfm') {
      if (code === 6) return 'No encontramos eso en Last.fm. Revisá cómo está escrito.'
      if (code === 10) return 'La API key de Last.fm falta o no es válida.'
      if (code === 17) {
        return 'Ese perfil de Last.fm es privado. Activá la opción de mostrar tu historial reciente en la privacidad de tu cuenta.'
      }
      if (code === 29) return 'Last.fm recibió demasiados pedidos. Probá de nuevo en un momento.'
    }

    if (service === 'spotify') {
      if (status === 401) return 'Tu sesión de Spotify expiró. Ingresá de nuevo.'
      if (status === 403) {
        return 'Spotify rechazó el pedido. Si la app está en modo desarrollo, tu cuenta tiene que estar agregada en "User Management" del dashboard.'
      }
      if (status === 429) return 'Spotify pidió ir más despacio. Probá de nuevo en unos segundos.'
    }

    if (status >= 500) return 'El servicio no está respondiendo ahora. Probá de nuevo en un rato.'
    return error.message
  }

  if (error instanceof TypeError) return 'No pudimos conectarnos. Revisá tu conexión a internet.'
  return error.message || 'Ocurrió un error inesperado.'
}

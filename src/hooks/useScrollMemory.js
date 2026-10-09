import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map()

/**
 * Recuerda hasta dónde bajó el usuario en esta pantalla y, si vuelve con el botón "atrás",
 * lo deja en el mismo lugar. Si entra por un link o por la navegación, empieza arriba.
 * Hay que usarlo en pantallas cuyo contenido se vuelve a dibujar completo al volver
 * (con el estado guardado y los resultados en caché).
 */
export default function useScrollMemory() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'POP' && positions.has(pathname)) window.scrollTo(0, positions.get(pathname))
    // Se guarda justo antes de que la pantalla se desmonte, cuando todavía se ve su contenido
    return () => positions.set(pathname, window.scrollY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
}

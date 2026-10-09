import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carga datos asíncronos y se encarga de cancelar, ignorar respuestas viejas y reintentar.
 *
 *   const result = useAsyncData(({ signal }) => getTopTracks(user, period, { signal }), `top:${user}:${period}`)
 *   result.data · result.error · result.loading · result.reload()
 *
 * Los datos se vuelven a pedir cuando cambia `key` (un string estable que describe el pedido).
 * Con `enabled: false` no se pide nada.
 *
 * Con `cache: true`, las respuestas exitosas se guardan en memoria mientras la app esté abierta:
 * al volver a una pantalla (por ejemplo con "atrás") aparecen al instante y no se vuelve a pedir nada.
 * `reload()` siempre vuelve a pedir.
 */
const cacheStore = new Map()
const CACHE_LIMIT = 60

function remember(key, data) {
  cacheStore.delete(key)
  cacheStore.set(key, data)
  if (cacheStore.size > CACHE_LIMIT) cacheStore.delete(cacheStore.keys().next().value)
}

export default function useAsyncData(fetcher, key, { enabled = true, cache = false } = {}) {
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const [reloadTick, setReloadTick] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: null })
  const cached = cache && enabled && cacheStore.has(key) ? cacheStore.get(key) : undefined

  useEffect(() => {
    if (!enabled) return
    if (cache && cacheStore.has(key) && reloadTick === 0) {
      setState({ key, data: cacheStore.get(key), error: null })
      return
    }
    const controller = new AbortController()
    let cancelled = false

    Promise.resolve()
      .then(() => fetcherRef.current({ signal: controller.signal }))
      .then((data) => {
        if (cancelled) return
        if (cache) remember(key, data ?? null)
        setState({ key, data: data ?? null, error: null })
      })
      .catch((error) => {
        if (cancelled || error?.name === 'AbortError') return
        setState({ key, data: null, error })
      })

    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, reloadTick])

  // Si el resultado guardado es de otro `key`, todavía no llegó el nuevo: está cargando.
  const settled = state.key === key
  const reload = useCallback(() => {
    cacheStore.delete(key)
    setState((current) => ({ ...current, key: null }))
    setReloadTick((tick) => tick + 1)
  }, [key])

  // Con caché, si ya hay datos de este `key` se devuelven en el mismo render (sin pasar por "cargando")
  if (!settled && cached !== undefined) return { data: cached, error: null, loading: false, reload }

  return {
    data: settled ? state.data : null,
    error: settled ? state.error : null,
    loading: enabled && !settled,
    reload,
  }
}

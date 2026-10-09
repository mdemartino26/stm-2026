import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/** Vuelve a la pantalla anterior; si se entró directo por un link, va a `fallback`. */
export default function useGoBack(fallback = '/') {
  const navigate = useNavigate()
  return useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(fallback)
  }, [navigate, fallback])
}

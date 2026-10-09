import { useEffect, useState } from 'react'
import { artworkKey, getArtwork, peekArtwork } from '../services/artwork.js'
import { useAuth } from './useAuth.js'

/**
 * Imagen (portada o foto de artista) desde Spotify, con cache.
 * Devuelve null mientras carga, si no hay sesión de Spotify, o si Spotify no tiene imagen.
 *
 *   const image = useArtwork('track', 'Creep', 'Radiohead', { enabled: !track.image })
 */
export default function useArtwork(kind, name, artist = '', { enabled = true } = {}) {
  const { status } = useAuth()
  const active = enabled && status === 'authenticated' && Boolean(name)
  const key = artworkKey(kind, name, artist)
  const [resolved, setResolved] = useState({ key: null, url: null })

  useEffect(() => {
    if (!active) return
    let cancelled = false
    getArtwork(kind, name, artist).then((url) => {
      if (!cancelled) setResolved({ key, url })
    })
    return () => {
      cancelled = true
    }
  }, [active, kind, name, artist, key])

  if (!active) return null
  return peekArtwork(kind, name, artist) ?? (resolved.key === key ? resolved.url : null)
}

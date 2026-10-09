/**
 * Ruta de "similares" para un artista o canción.
 *   similarPath({ type: 'artist', name: 'Radiohead' })
 *   similarPath({ type: 'track', name: 'Creep', artist: 'Radiohead' })
 * Todo viaja en la URL: se puede compartir y el botón "atrás" funciona.
 */
export function similarPath({ type, name, artist }) {
  const params = new URLSearchParams({ type, name })
  if (type === 'track' && artist) params.set('artist', artist)
  return `/similares?${params.toString()}`
}

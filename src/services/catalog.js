// Búsqueda de artistas y canciones.
// Con sesión de Spotify: resultados de Spotify (con portadas).
// En modo demo (sin sesión): Last.fm, que no necesita login pero no trae imágenes.
import * as lastfm from './lastfm.js'
import { searchSpotify } from './spotifyApi.js'

export function searchCatalog({ type, query, source, signal }) {
  if (source === 'spotify') return searchSpotify({ type, query, signal })
  return type === 'artist' ? lastfm.searchArtists(query, { signal }) : lastfm.searchTracks(query, { signal })
}

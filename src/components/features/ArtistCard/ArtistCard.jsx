import useArtwork from '../../../hooks/useArtwork.js'
import { similarPath } from '../../../utils/routes.js'
import MediaCard from '../MediaCard/MediaCard.jsx'

/**
 * Tarjeta de un artista. Si no trae imagen, la busca en Spotify (cuando hay sesión).
 * Al tocarla lleva a los artistas similares.
 *   <ArtistCard artist={{ name: 'Radiohead' }} subtitle="87% similar" />
 */
export default function ArtistCard({ artist, subtitle, badge }) {
  const fetched = useArtwork('artist', artist.name, '', { enabled: !artist.image })
  return (
    <MediaCard
      shape="circle"
      title={artist.name}
      subtitle={subtitle ?? artist.genres?.[0]}
      image={artist.image ?? fetched}
      badge={badge}
      to={similarPath({ type: 'artist', name: artist.name })}
    />
  )
}

import { CardGrid, CardGridItem, List } from '../../ui'
import ArtistCard from '../ArtistCard/ArtistCard.jsx'
import TrackListItem from '../TrackListItem/TrackListItem.jsx'

/** Resultados de búsqueda: artistas en grilla de tarjetas, canciones en lista. */
export default function SearchResults({ type, items }) {
  if (type === 'artist') {
    return (
      <CardGrid>
        {items.map((artist) => (
          <CardGridItem key={artist.id}>
            <ArtistCard artist={artist} />
          </CardGridItem>
        ))}
      </CardGrid>
    )
  }

  return (
    <List aria-label="Canciones encontradas">
      {items.map((track) => (
        <TrackListItem key={track.id} track={track} extraSupporting={track.album} />
      ))}
    </List>
  )
}

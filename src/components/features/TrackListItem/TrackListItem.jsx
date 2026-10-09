import useArtwork from '../../../hooks/useArtwork.js'
import { similarPath } from '../../../utils/routes.js'
import { Artwork, ListItem, Text } from '../../ui'
import styles from './TrackListItem.module.css'

/**
 * Fila de una canción: portada, título, artista y un dato a la derecha.
 * Al tocarla lleva a las canciones similares.
 *   <TrackListItem track={t} rank={1} trailing="142 reprod." extraSupporting="87% similar" />
 */
export default function TrackListItem({ track, rank, trailing, extraSupporting }) {
  const artist = track.primaryArtist ?? track.artist
  const fetched = useArtwork('track', track.name, artist, { enabled: !track.image })
  const supporting = [track.artist, extraSupporting].filter(Boolean).join(' · ')

  return (
    <ListItem
      to={similarPath({ type: 'track', name: track.name, artist })}
      leading={
        <>
          {rank != null && (
            <Text variant="title-medium" color="on-surface-variant" className={styles.rank}>
              {rank}
            </Text>
          )}
          <Artwork src={track.image ?? fetched} name={track.name} size={56} />
        </>
      }
      headline={track.name}
      supporting={supporting}
      trailing={trailing}
    />
  )
}

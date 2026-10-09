import { Skeleton } from '../../ui'
import ArtistCard from '../ArtistCard/ArtistCard.jsx'
import styles from './RecentArtistsRow.module.css'

/** Carrusel horizontal con los artistas escuchados hace poco. */
export default function RecentArtistsRow({ artists }) {
  return (
    <ul className={styles.row} aria-label="Artistas escuchados recientemente">
      {artists.map((artist) => (
        <li key={artist.id} className={styles.item}>
          <ArtistCard artist={artist} badge={artist.nowPlaying ? 'Sonando' : undefined} />
        </li>
      ))}
    </ul>
  )
}

/** Placeholder con la misma forma que el carrusel, para mostrar mientras carga. */
export function RecentArtistsSkeleton({ count = 6 }) {
  return (
    <ul className={styles.row} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={styles.item}>
          <Skeleton height={190} />
        </li>
      ))}
    </ul>
  )
}

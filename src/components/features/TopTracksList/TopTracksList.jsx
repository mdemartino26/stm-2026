import { formatNumber } from '../../../utils/format.js'
import { List, Skeleton } from '../../ui'
import TrackListItem from '../TrackListItem/TrackListItem.jsx'
import styles from './TopTracksList.module.css'

/** Ranking de canciones con la cantidad de reproducciones. */
export default function TopTracksList({ tracks }) {
  return (
    <List aria-label="Canciones más escuchadas">
      {tracks.map((track) => (
        <TrackListItem
          key={track.id}
          track={track}
          rank={track.rank}
          trailing={`${formatNumber(track.playcount)} reprod.`}
        />
      ))}
    </List>
  )
}

export function TopTracksSkeleton({ count = 8 }) {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} height={72} />
      ))}
    </div>
  )
}

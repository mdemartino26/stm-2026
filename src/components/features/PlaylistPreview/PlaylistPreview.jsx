import { Button, ChipGroup, AssistChip, List, Skeleton, Text } from '../../ui'
import TrackListItem from '../TrackListItem/TrackListItem.jsx'
import styles from './PlaylistPreview.module.css'

/**
 * Vista previa de una playlist armada: título, etiquetas, canciones y acciones.
 *   <PlaylistPreview title="Mood · Día de lluvia" tags={['rainy day']} tracks={tracks}
 *                    note="Artistas puente: Muse" onReshuffle={…} onSave={…} canSave />
 *
 * Con `canSave={false}` el botón de guardar se cambia por `signInAction` (por ejemplo "Ingresá con Spotify").
 */
export default function PlaylistPreview({ title, tags = [], tracks, note, onReshuffle, onSave, canSave, signInAction, busy = false }) {
  return (
    <section className={styles.preview} aria-label="Playlist armada">
      <div className={styles.header}>
        <div className={styles.titles}>
          <Text variant="label-large" color="primary">
            Tu playlist
          </Text>
          <Text as="h2" variant="headline-small" weight={700}>
            {title}
          </Text>
          <Text as="p" variant="body-medium" color="on-surface-variant">
            {tracks.length} canciones
          </Text>
        </div>
        <div className={styles.actions}>
          <Button variant="outlined" icon="refresh" onClick={onReshuffle} disabled={busy}>
            Otra tanda
          </Button>
          {canSave ? (
            <Button icon="playlistAdd" onClick={onSave} disabled={busy}>
              Guardar en Spotify
            </Button>
          ) : (
            signInAction
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <ChipGroup label="Etiquetas de la playlist" wrap>
          {tags.map((tag) => (
            <AssistChip key={tag}>{tag}</AssistChip>
          ))}
        </ChipGroup>
      )}

      {note && (
        <Text as="p" variant="body-medium" color="on-surface-variant">
          {note}
        </Text>
      )}

      <List aria-label="Canciones de la playlist">
        {tracks.map((track) => (
          <TrackListItem key={`${track.artist}::${track.name}`} track={{ ...track, id: `${track.artist}::${track.name}` }} />
        ))}
      </List>
    </section>
  )
}

export function PlaylistPreviewSkeleton({ count = 8 }) {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <Skeleton height={96} />
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} height={72} />
      ))}
    </div>
  )
}

import useArtwork from '../../../hooks/useArtwork.js'
import { Artwork, Text } from '../../ui'
import styles from './SeedHeader.module.css'

/**
 * Cabecera de la pantalla de similares: la imagen y el nombre del artista o canción de partida.
 *   <SeedHeader seed={{ type: 'track', name: 'Creep', artist: 'Radiohead' }} actions={<Button …/>} />
 */
export default function SeedHeader({ seed, actions }) {
  const image = useArtwork(seed.type, seed.name, seed.artist ?? '')
  const isArtist = seed.type === 'artist'

  return (
    <header className={styles.seed}>
      <Artwork src={image} name={seed.name} shape={isArtist ? 'circle' : 'rounded'} size={96} />
      <div className={styles.text}>
        <Text variant="label-large" color="primary">
          {isArtist ? 'Artistas similares a' : 'Canciones similares a'}
        </Text>
        <Text as="h1" variant="headline-small" weight={700} className={styles.title}>
          {seed.name}
        </Text>
        {!isArtist && (
          <Text variant="body-large" color="on-surface-variant">
            {seed.artist}
          </Text>
        )}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}

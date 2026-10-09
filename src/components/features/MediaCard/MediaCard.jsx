import { cn } from '../../../utils/cn.js'
import { Artwork, AssistChip, Card, Text } from '../../ui'
import styles from './MediaCard.module.css'

/**
 * Tarjeta vertical con imagen, título y subtítulo. Es la base de ArtistCard.
 *   <MediaCard title="Radiohead" subtitle="Rock alternativo" image={url} shape="circle" to="/ruta" badge="Sonando" />
 * shape: circle (artistas) | rounded (álbumes y canciones)
 */
export default function MediaCard({ title, subtitle, image, shape = 'rounded', to, badge, className }) {
  return (
    <Card to={to} className={className}>
      <span className={cn(styles.body, shape === 'circle' && styles.centered)}>
        <Artwork src={image} name={title} shape={shape} />
        <span className={styles.text}>
          <Text as="span" variant="title-small" truncate>
            {title}
          </Text>
          {subtitle && (
            <Text as="span" variant="body-small" color="on-surface-variant" truncate>
              {subtitle}
            </Text>
          )}
        </span>
        {badge && <AssistChip className={styles.badge}>{badge}</AssistChip>}
      </span>
    </Card>
  )
}

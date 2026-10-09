import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import Text from '../Text/Text.jsx'
import styles from './EmptyState.module.css'

/**
 * Pantalla vacía o de error: ícono, título, explicación y una acción opcional.
 *   <EmptyState icon="search" title="Sin resultados" description="Probá con otra búsqueda." action={<Button>…</Button>} />
 * tone: neutral | error  (el de error se anuncia a lectores de pantalla)
 */
export default function EmptyState({ icon, title, description, action, tone = 'neutral', className }) {
  return (
    <div className={cn(styles.empty, tone === 'error' && styles.error, className)} role={tone === 'error' ? 'alert' : undefined}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={32} />
        </span>
      )}
      <Text as="h2" variant="title-large" weight={600}>
        {title}
      </Text>
      {description && (
        <Text as="p" variant="body-medium" color="on-surface-variant" className={styles.description}>
          {description}
        </Text>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

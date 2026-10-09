import { cn } from '../../../utils/cn.js'
import { Text } from '../../ui'
import styles from './PageHeader.module.css'

/**
 * Encabezado de página: título grande, texto de apoyo y acciones a la derecha.
 *   <PageHeader title="Hola, Ana" subtitle="Tu historial de Last.fm" actions={<Button …/>} />
 * align="center" centra todo (para las pantallas de formulario).
 */
export default function PageHeader({ title, subtitle, eyebrow, actions, align = 'start' }) {
  return (
    <header className={cn(styles.header, align === 'center' && styles.center)}>
      <div className={styles.titles}>
        {eyebrow && (
          <Text variant="label-large" color="primary">
            {eyebrow}
          </Text>
        )}
        <Text as="h1" variant="headline-small" weight={700} className={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text as="p" variant="body-large" color="on-surface-variant">
            {subtitle}
          </Text>
        )}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}

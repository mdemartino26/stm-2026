import { useId } from 'react'
import { Text } from '../../ui'
import styles from './Section.module.css'

/**
 * Sección de página con título (queda asociado a la región para lectores de pantalla).
 *   <Section title="Canciones más escuchadas" subtitle="Último mes" action={<Button …/>}>…</Section>
 */
export default function Section({ title, subtitle, action, children }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <Text as="h2" id={headingId} variant="title-large" weight={700}>
            {title}
          </Text>
          {subtitle && (
            <Text as="p" variant="body-medium" color="on-surface-variant">
              {subtitle}
            </Text>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

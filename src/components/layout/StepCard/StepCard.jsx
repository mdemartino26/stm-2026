import { useId } from 'react'
import { Card, Text } from '../../ui'
import styles from './StepCard.module.css'

/**
 * Bloque numerado de un formulario por pasos: número, título, texto de apoyo y contenido.
 *   <StepCard step={1} title="Contá cómo estás" subtitle="Con tus palabras">…</StepCard>
 */
export default function StepCard({ step, title, subtitle, children }) {
  const headingId = useId()
  return (
    <Card as="section" variant="outlined" className={styles.card} aria-labelledby={headingId}>
      <header className={styles.header}>
        {step != null && (
          <span className={styles.step} aria-hidden="true">
            {step}
          </span>
        )}
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
      </header>
      {children}
    </Card>
  )
}

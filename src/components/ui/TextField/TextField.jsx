import { useId } from 'react'
import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import Text from '../Text/Text.jsx'
import styles from './TextField.module.css'

/**
 * Campo de texto "outlined" de M3 (56dp) con etiqueta flotante.
 *   <TextField label="Usuario de Last.fm" value={v} onChange={…} supportingText="Ej: rj" error={!!error} />
 * Acepta cualquier prop de <input> (name, autoComplete, required, …).
 */
export default function TextField({ label, supportingText, error = false, leadingIcon, className, id, ...inputProps }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helpId = `${inputId}-help`

  return (
    <div className={cn(styles.field, error && styles.error, leadingIcon && styles.hasIcon, className)}>
      <div className={styles.container}>
        {leadingIcon && <Icon name={leadingIcon} className={styles.leading} />}
        <input
          id={inputId}
          className={styles.input}
          placeholder=" "
          aria-invalid={error || undefined}
          aria-describedby={supportingText ? helpId : undefined}
          {...inputProps}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      </div>
      {supportingText && (
        <Text as="p" id={helpId} variant="body-small" color={error ? 'error' : 'on-surface-variant'} className={styles.help}>
          {supportingText}
        </Text>
      )}
    </div>
  )
}

import { useId } from 'react'
import { cn } from '../../../utils/cn.js'
import Text from '../Text/Text.jsx'
import styles from './TextArea.module.css'

/**
 * Campo de texto multilínea "outlined" de M3, con la etiqueta siempre sobre el borde y contador opcional.
 *   <TextArea label="Tu mood" value={v} onChange={…} placeholder="Ej: domingo de lluvia" maxLength={200} />
 * Acepta cualquier prop de <textarea>.
 */
export default function TextArea({ label, supportingText, className, id, maxLength, value = '', rows = 4, ...textareaProps }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helpId = `${inputId}-help`

  return (
    <div className={cn(styles.field, className)}>
      <div className={styles.container}>
        <textarea
          id={inputId}
          className={styles.input}
          rows={rows}
          value={value}
          maxLength={maxLength}
          aria-describedby={supportingText ? helpId : undefined}
          {...textareaProps}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      </div>
      <div className={styles.footer}>
        {supportingText && (
          <Text as="p" id={helpId} variant="body-small" color="on-surface-variant">
            {supportingText}
          </Text>
        )}
        {maxLength && (
          <Text as="span" variant="body-small" color="on-surface-variant" className={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        )}
      </div>
    </div>
  )
}

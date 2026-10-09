import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import styles from './Chip.module.css'

/**
 * Agrupa chips. Por defecto se desplaza horizontalmente si no entran; con `wrap` pasan a la línea siguiente.
 * `label` es su nombre accesible.
 */
export function ChipGroup({ label, children, wrap = false, className }) {
  return (
    <div role="group" aria-label={label} className={cn(styles.group, wrap && styles.wrap, className)}>
      {children}
    </div>
  )
}

/** Chip de filtro de M3 (alterna entre seleccionado y no seleccionado). */
export function FilterChip({ selected = false, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(styles.chip, styles.filter, selected && styles.selected)}
      onClick={onClick}
    >
      {selected && <Icon name="check" size={18} />}
      <span>{children}</span>
    </button>
  )
}

/** Chip informativo, no interactivo (etiquetas de estado como "Modo demo"). */
export function AssistChip({ icon, children, className }) {
  return (
    <span className={cn(styles.chip, styles.assist, className)}>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </span>
  )
}

/**
 * Chip de entrada de M3: una selección del usuario que se puede quitar.
 *   <InputChip icon="mood" onRemove={() => quitar(id)} removeLabel="Quitar Tranqui">Tranqui</InputChip>
 * `icon` (opcional) distingue el tipo de selección: un mood, un género, algo a evitar…
 */
export function InputChip({ icon, onRemove, removeLabel, children }) {
  return (
    <span className={cn(styles.chip, styles.input, icon && styles.withIcon)}>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      <button type="button" className={styles.remove} aria-label={removeLabel ?? 'Quitar'} onClick={onRemove}>
        <Icon name="close" size={18} />
      </button>
    </span>
  )
}

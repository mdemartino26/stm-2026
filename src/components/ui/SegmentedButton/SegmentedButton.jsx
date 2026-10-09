import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import styles from './SegmentedButton.module.css'

/**
 * Botón segmentado de M3 (elegir una opción entre 2 a 5).
 *   <SegmentedButton label="Tipo de búsqueda" value={type} onChange={setType}
 *     options={[{ value: 'artist', label: 'Artistas', icon: 'person' }, …]} />
 */
export default function SegmentedButton({ options, value, onChange, label, className }) {
  return (
    <div role="group" aria-label={label} className={cn(styles.group, className)}>
      {options.map((option) => {
        const selected = option.value === value
        const icon = selected ? 'check' : option.icon
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            className={cn(styles.segment, selected && styles.selected)}
            onClick={() => onChange(option.value)}
          >
            {icon && <Icon name={icon} size={18} />}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

import { cn } from '../../../utils/cn.js'
import styles from './CircularProgress.module.css'

/** Indicador de progreso circular indeterminado de M3. Toma el color de --progress-color. */
export default function CircularProgress({ size = 40, label = 'Cargando', className }) {
  return (
    <svg
      className={cn(styles.progress, className)}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="progressbar"
      aria-label={label}
    >
      <circle className={styles.arc} cx="24" cy="24" r="18" />
    </svg>
  )
}

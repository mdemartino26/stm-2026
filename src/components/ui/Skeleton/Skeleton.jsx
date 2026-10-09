import { cn } from '../../../utils/cn.js'
import styles from './Skeleton.module.css'

/**
 * Placeholder animado mientras carga el contenido real.
 *   <Skeleton shape="circle" width={96} height={96} />
 *   <Skeleton shape="text" width="60%" />
 * shape: rect | circle | text
 */
export default function Skeleton({ shape = 'rect', width, height, className }) {
  return (
    <span
      className={cn(styles.skeleton, styles[shape], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

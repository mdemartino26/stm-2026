import { cn } from '../../../utils/cn.js'
import styles from './CardGrid.module.css'

/**
 * Grilla responsiva para tarjetas: tantas columnas como entren con un ancho mínimo por tarjeta.
 * En compact quedan 2 columnas, y crecen hasta 6 en pantallas grandes.
 *   <CardGrid minWidth={148}><CardGridItem><MediaCard …/></CardGridItem></CardGrid>
 */
export function CardGrid({ minWidth = 148, children, className, style, ...rest }) {
  return (
    <ul
      className={cn(styles.grid, className)}
      style={{ '--card-min-width': `${minWidth}px`, ...style }}
      {...rest}
    >
      {children}
    </ul>
  )
}

export function CardGridItem({ children }) {
  return <li className={styles.item}>{children}</li>
}

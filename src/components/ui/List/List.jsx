import { Link } from 'react-router-dom'
import { cn } from '../../../utils/cn.js'
import Text from '../Text/Text.jsx'
import styles from './List.module.css'

/** Contenedor de una lista de M3. Sus hijos son <ListItem />. */
export function List({ children, className, ...rest }) {
  return (
    <ul className={cn(styles.list, className)} {...rest}>
      {children}
    </ul>
  )
}

/**
 * Elemento de lista de M3 (56 / 72 / 88dp según `lines`).
 *   <ListItem leading={<Artwork …/>} headline="Creep" supporting="Radiohead" trailing="42 plays" to="/ruta" />
 *
 * Con `to`, toda la fila es un link con state layer; con `onClick`, un botón. `trailing` es solo visual
 * (por ejemplo un ícono): el que actúa es la fila entera.
 */
export function ListItem({ leading, overline, headline, supporting, trailing, to, onClick, disabled = false, lines = 2, className }) {
  const body = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.content}>
        {overline && (
          <Text as="span" variant="label-small" color="primary">
            {overline}
          </Text>
        )}
        <Text as="span" variant="body-large" truncate>
          {headline}
        </Text>
        {supporting && (
          <Text as="span" variant="body-medium" color="on-surface-variant" truncate>
            {supporting}
          </Text>
        )}
      </span>
      {trailing && (
        <Text as="span" variant="label-medium" color="on-surface-variant" className={styles.trailing}>
          {trailing}
        </Text>
      )}
    </>
  )

  const classes = cn(styles.item, styles[`lines${lines}`], (to || onClick) && !disabled && styles.interactive, onClick && styles.button, className)

  let row = <div className={classes}>{body}</div>
  if (to) {
    row = (
      <Link to={to} className={classes}>
        {body}
      </Link>
    )
  } else if (onClick) {
    row = (
      <button type="button" className={classes} onClick={onClick} disabled={disabled}>
        {body}
      </button>
    )
  }
  return <li>{row}</li>
}

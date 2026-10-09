import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../../utils/cn.js'
import styles from './Card.module.css'

/**
 * Tarjeta de M3. Es solo el contenedor: lo que lleva adentro lo decide quien la usa.
 *   <Card variant="outlined">…</Card>
 *   <Card to="/ruta">…</Card>       (toda la tarjeta es un link, con state layer)
 *
 * variant: filled | elevated | outlined
 * as: etiqueta HTML cuando no es un link (div por defecto, ej. as="form")
 */
const Card = forwardRef(function Card({ variant = 'filled', as: Tag = 'div', to, href, className, children, ...rest }, ref) {
  const interactive = Boolean(to || href)
  const classes = cn(styles.card, styles[variant], interactive && styles.interactive, className)

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  )
})

export default Card

import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../../utils/cn.js'
import Icon from '../Icon/Icon.jsx'
import styles from './IconButton.module.css'

/**
 * Botón de ícono de M3 (40dp con área táctil de 48dp). `label` es obligatorio: es el nombre accesible.
 *   <IconButton icon="close" label="Cerrar" onClick={...} />
 *   <IconButton icon="arrowBack" label="Volver" to="/buscar" />
 *
 * variant: standard | filled | tonal | outlined
 */
const IconButton = forwardRef(function IconButton(
  { icon, label, variant = 'standard', size = 24, to, href, disabled = false, type = 'button', className, ...rest },
  ref,
) {
  const classes = cn(styles.iconButton, styles[variant], className)
  const common = { className: classes, 'aria-label': label, title: label }
  const content = <Icon name={icon} size={size} />

  if (to && !disabled) {
    return (
      <Link ref={ref} to={to} {...common} {...rest}>
        {content}
      </Link>
    )
  }
  if (href && !disabled) {
    return (
      <a ref={ref} href={href} {...common} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button ref={ref} type={type} disabled={disabled} {...common} {...rest}>
      {content}
    </button>
  )
})

export default IconButton

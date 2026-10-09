import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../../utils/cn.js'
import CircularProgress from '../CircularProgress/CircularProgress.jsx'
import Icon from '../Icon/Icon.jsx'
import styles from './Button.module.css'

const ICON_SIZE = { sm: 18, md: 24, lg: 32 }

/**
 * Botón de M3. Un solo componente para todos los botones de la app.
 *
 *   <Button onClick={...}>Guardar</Button>
 *   <Button variant="outlined" size="md" icon="playlistAdd">Crear playlist</Button>
 *   <Button to="/dashboard">Ir al dashboard</Button>                  (link interno)
 *   <Button href="https://…" target="_blank" rel="noreferrer">…</Button> (link externo)
 *
 * variant: filled | tonal | elevated | outlined | text
 * size:    sm (40dp) | md (56dp) | lg (96dp)
 * loading: muestra un spinner y bloquea los clics
 */
const Button = forwardRef(function Button(
  {
    variant = 'filled',
    size = 'sm',
    icon,
    loading = false,
    fullWidth = false,
    disabled = false,
    to,
    href,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const classes = cn(
    styles.button,
    styles[variant],
    styles[size],
    (icon || loading) && styles.hasIcon,
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  )
  const handleClick = loading ? (event) => event.preventDefault() : onClick

  const content = (
    <>
      {loading ? <CircularProgress size={ICON_SIZE[size]} label="Cargando" /> : icon && <Icon name={icon} size={ICON_SIZE[size]} />}
      <span>{children}</span>
    </>
  )

  if (to && !disabled) {
    return (
      <Link ref={ref} to={to} className={classes} onClick={handleClick} {...rest}>
        {content}
      </Link>
    )
  }
  if (href && !disabled) {
    return (
      <a ref={ref} href={href} className={classes} onClick={handleClick} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {content}
    </button>
  )
})

export default Button

import { Link } from 'react-router-dom'
import { logoSrc } from '../../../assets/index.js'
import { cn } from '../../../utils/cn.js'
import styles from './Logo.module.css'

/**
 * Logo de la marca. Con `to` es un link (por defecto al inicio); con to={null} es solo la imagen.
 *   <Logo height={40} />
 */
export default function Logo({ height = 48, to = '/', className }) {
  const image = <img className={styles.image} src={logoSrc} alt="Set The Mood" style={{ height }} />

  if (!to) return <span className={cn(styles.logo, className)}>{image}</span>
  return (
    <Link to={to} className={cn(styles.logo, className)}>
      {image}
    </Link>
  )
}

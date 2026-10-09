import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../../utils/cn.js'
import { Icon } from '../../ui'
import styles from './Navigation.module.css'

/**
 * Navegación principal de M3. Un solo componente que se adapta al tamaño de ventana:
 *   compact (< 600dp):   barra de navegación inferior de 80dp
 *   medium en adelante:  navigation rail lateral de 80dp
 *
 * items: [{ to, label, icon, match: ['/ruta', …] }]  (match decide cuándo el destino está activo)
 */
export default function Navigation({ items }) {
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav} aria-label="Principal">
      <ul className={styles.list}>
        {items.map((item) => {
          const active = item.match.some((prefix) => pathname.startsWith(prefix))
          return (
            <li key={item.to} className={styles.listItem}>
              <Link
                to={item.to}
                className={cn(styles.item, active && styles.active)}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.indicator}>
                  <Icon name={item.icon} />
                </span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

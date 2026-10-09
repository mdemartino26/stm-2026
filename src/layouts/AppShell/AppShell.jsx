import { useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Navigation, TopAppBar } from '../../components/layout'
import { NAV_ITEMS } from '../../config/constants.js'
import styles from './AppShell.module.css'

/** Estructura de las pantallas con sesión: barra superior + navegación adaptativa + contenido. */
export default function AppShell() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  // Al ir a otra pantalla se vuelve arriba. Con "atrás" no: cada pantalla recupera su lugar (useScrollMemory)
  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className={styles.shell}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <TopAppBar />
      <Navigation items={NAV_ITEMS} />
      <main id="contenido" className={styles.main} tabIndex={-1}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

import { useAuth } from '../../../hooks/useAuth.js'
import { Artwork, AssistChip, IconButton, Text } from '../../ui'
import Logo from '../Logo/Logo.jsx'
import styles from './TopAppBar.module.css'

/** Barra superior pequeña de M3 (64dp): logo a la izquierda, cuenta y salir a la derecha. */
export default function TopAppBar() {
  const { profile, isDemo, logout } = useAuth()
  const name = isDemo ? 'Invitadx' : (profile?.displayName ?? 'Tu cuenta')

  return (
    <header className={styles.bar}>
      <Logo height={40} />
      <span className={styles.spacer} />
      {isDemo && <AssistChip icon="info">Modo demo</AssistChip>}
      <span className={styles.user}>
        <Artwork shape="circle" size={32} src={profile?.image} name={name} />
        <Text variant="label-large" truncate className={styles.userName}>
          {name}
        </Text>
      </span>
      <IconButton icon="logout" label={isDemo ? 'Salir del modo demo' : 'Cerrar sesión'} onClick={logout} />
    </header>
  )
}

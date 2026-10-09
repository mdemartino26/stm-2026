import { Navigate } from 'react-router-dom'
import { backgroundSrc } from '../../assets/index.js'
import { Button, Text } from '../../components/ui'
import { Logo } from '../../components/layout'
import { HOME_PATH, SPOTIFY_SIGNUP_URL } from '../../config/constants.js'
import { useAuth } from '../../hooks/useAuth.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import useLogin from '../../hooks/useLogin.js'
import styles from './Landing.module.css'

/** Portada: ingreso con Spotify, registro (lleva al alta de Spotify) y modo demo sin cuenta. */
export default function Landing() {
  useDocumentTitle()
  const { status, enterDemo } = useAuth()
  const { login, loading } = useLogin()

  if (status !== 'anonymous') return <Navigate to={HOME_PATH} replace />

  return (
    <div className={styles.page}>
      {/* Imagen decorativa (src/assets/background.svg). Va como <img> y no como background-image
          para no depender del formato del archivo ni de cómo el bundler lo inserta en el CSS. */}
      <img className={styles.backdrop} src={backgroundSrc} alt="" aria-hidden="true" />

      <header className={styles.header}>
        <Logo height={48} to={null} />
      </header>

      <main className={styles.hero}>
        <Text as="h1" variant="title-large" weight={700}>
          Bienvenidx a Set The Mood
        </Text>
        <Text as="p" variant="headline-small" className={styles.tagline}>
          Expandí tu experiencia musical conociendo artistas nuevos
        </Text>

        <div className={styles.actions}>
          <Button size="md" fullWidth loading={loading} onClick={login}>
            Ingresá
          </Button>
          <Button
            variant="outlined"
            size="md"
            fullWidth
            href={SPOTIFY_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Registrate
          </Button>
        </div>

        <div className={styles.demo}>
          <Button variant="text" icon="explore" onClick={enterDemo}>
            Probar sin cuenta (modo demo)
          </Button>
          <Text as="p" variant="body-small" color="on-surface-variant">
            Ingresás con tu cuenta de Spotify. Nunca vemos tu contraseña.
          </Text>
        </div>
      </main>
    </div>
  )
}

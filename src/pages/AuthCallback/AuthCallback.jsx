import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, CircularProgress, EmptyState, Text } from '../../components/ui'
import { HOME_PATH } from '../../config/constants.js'
import { useAuth } from '../../hooks/useAuth.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import styles from './AuthCallback.module.css'

/** Spotify vuelve acá con ?code=…&state=…; se completa el login y se pasa a la pantalla principal. */
export default function AuthCallback() {
  useDocumentTitle('Conectando con Spotify')
  const { completeLogin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    completeLogin(new URLSearchParams(window.location.search))
      .then(() => {
        if (active) navigate(HOME_PATH, { replace: true })
      })
      .catch((caught) => {
        if (active) setError(caught)
      })
    return () => {
      active = false
    }
  }, [completeLogin, navigate])

  if (error) {
    return (
      <main className={styles.page}>
        <EmptyState
          tone="error"
          icon="error"
          title="No pudimos iniciar sesión"
          description={error.message}
          action={
            <Button to="/" replace>
              Volver al inicio
            </Button>
          }
        />
      </main>
    )
  }

  return (
    <main className={styles.page} role="status">
      <CircularProgress label="Conectando con Spotify" />
      <Text variant="body-large" color="on-surface-variant">
        Conectando con Spotify…
      </Text>
    </main>
  )
}

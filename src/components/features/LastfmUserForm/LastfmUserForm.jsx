import { useState } from 'react'
import { Button, Card, Text, TextField } from '../../ui'
import styles from './LastfmUserForm.module.css'

// Last.fm: 2 a 15 caracteres, empieza con letra; solo letras, números, guion y guion bajo.
const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{1,14}$/

/**
 * Formulario para indicar el usuario de Last.fm.
 *   <LastfmUserForm initialValue="rj" onSubmit={(user) => …} onCancel={() => …} />
 */
export default function LastfmUserForm({ initialValue = '', onSubmit, onCancel }) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const username = value.trim()
    if (!USERNAME_PATTERN.test(username)) {
      setError('Usá de 2 a 15 caracteres: letras, números, guion o guion bajo.')
      return
    }
    setError('')
    onSubmit(username)
  }

  return (
    <Card as="form" variant="outlined" className={styles.card} onSubmit={handleSubmit} noValidate>
      <div className={styles.body}>
        <Text as="h2" variant="title-large" weight={700}>
          Conectá tu Last.fm
        </Text>
        <Text as="p" variant="body-medium" color="on-surface-variant">
          Escribí tu usuario público de Last.fm para ver tus últimos artistas y tus canciones más escuchadas.
        </Text>
        <TextField
          label="Usuario de Last.fm"
          leadingIcon="person"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          error={Boolean(error)}
          supportingText={error || 'Es el nombre que aparece en last.fm/user/…'}
        />
        <div className={styles.actions}>
          {onCancel && (
            <Button variant="text" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">Ver mi música</Button>
        </div>
      </div>
    </Card>
  )
}

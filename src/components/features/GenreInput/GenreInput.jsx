import { useEffect, useRef, useState } from 'react'
import { resolveGenre } from '../../../services/genreResolver.js'
import { Button, ChipGroup, FilterChip, TextField } from '../../ui'
import styles from './GenreInput.module.css'

/**
 * Campo para agregar un género (cualquiera que exista en Last.fm: "hyperpop", "shoegaze", "city pop"…)
 * con atajos para los más comunes.
 *
 *   <GenreInput label="Agregar un género" suggestions={[{ id, label, tags }]} selectedIds={['rock']}
 *               onAdd={(genre) => …} onRemove={(id) => …} />
 *
 * Con un atajo ya elegido, tocarlo lo quita (`onRemove`).
 */
export default function GenreInput({ label = 'Agregar un género', helperText, suggestions = [], selectedIds = [], onAdd, onRemove, groupLabel = 'Géneros sugeridos' }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const controllerRef = useRef(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const submit = async (event) => {
    event.preventDefault()
    if (!text.trim() || checking) return
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setChecking(true)
    setError('')
    try {
      const genre = await resolveGenre(text, { signal: controller.signal })
      onAdd(genre)
      setText('')
    } catch (caught) {
      if (caught?.name === 'AbortError') return
      setError(caught?.message || 'No pudimos comprobar ese género. Probá de nuevo.')
    } finally {
      if (controllerRef.current === controller) setChecking(false)
    }
  }

  return (
    <div className={styles.input}>
      {suggestions.length > 0 && (
        <ChipGroup label={groupLabel} wrap>
          {suggestions.map((genre) => {
            const selected = selectedIds.includes(genre.id)
            return (
              <FilterChip key={genre.id} selected={selected} onClick={() => (selected ? onRemove(genre.id) : onAdd(genre))}>
                {genre.label}
              </FilterChip>
            )
          })}
        </ChipGroup>
      )}
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField
          className={styles.field}
          label={label}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            setError('')
          }}
          error={Boolean(error)}
          supportingText={error || helperText}
          autoComplete="off"
          spellCheck="false"
        />
        <Button type="submit" variant="tonal" icon="add" loading={checking} disabled={!text.trim()}>
          Agregar
        </Button>
      </form>
    </div>
  )
}

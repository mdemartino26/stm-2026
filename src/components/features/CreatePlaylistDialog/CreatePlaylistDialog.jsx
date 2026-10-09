import { useEffect, useRef, useState } from 'react'
import { useSnackbar } from '../../../hooks/useSnackbar.js'
import { friendlyError } from '../../../utils/errors.js'
import { Button, CircularProgress, Dialog, Text, TextField } from '../../ui'
import styles from './CreatePlaylistDialog.module.css'

function progressMessage(progress) {
  if (progress?.phase === 'matching') return `Buscando las canciones en Spotify (${progress.done}/${progress.total})…`
  if (progress?.phase === 'creating') return 'Creando la playlist en tu cuenta…'
  return 'Buscando canciones parecidas en Last.fm…'
}

function PlaylistDialog({ open, onClose, defaultName, description, intro, build }) {
  const { show } = useSnackbar()
  const [name, setName] = useState(defaultName)
  const [phase, setPhase] = useState('idle') // idle | working | done | error
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  // Si se cierra el diálogo con una tarea en curso, se cancela
  useEffect(() => () => controllerRef.current?.abort(), [])

  const create = async () => {
    const controller = new AbortController()
    controllerRef.current = controller
    setPhase('working')
    setError(null)
    setProgress({ phase: 'collecting' })
    try {
      const created = await build({
        name: name.trim() || defaultName,
        description,
        signal: controller.signal,
        onProgress: setProgress,
      })
      setResult(created)
      setPhase('done')
      show(`Playlist creada con ${created.added} canciones`)
    } catch (caught) {
      if (caught?.name === 'AbortError') return
      setError(caught)
      setPhase('error')
    }
  }

  const cancel = () => {
    controllerRef.current?.abort()
    onClose()
  }

  const working = phase === 'working'

  let actions
  if (phase === 'done') {
    actions = (
      <>
        <Button variant="text" onClick={onClose}>
          Cerrar
        </Button>
        <Button icon="openInNew" href={result.playlist.url} target="_blank" rel="noopener noreferrer">
          Abrir en Spotify
        </Button>
      </>
    )
  } else {
    actions = (
      <>
        <Button variant="text" onClick={cancel}>
          Cancelar
        </Button>
        {!working && <Button onClick={create}>{phase === 'error' ? 'Reintentar' : 'Crear playlist'}</Button>}
      </>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="Crear playlist" icon="playlistAdd" dismissible={!working} actions={actions}>
      {phase === 'done' ? (
        <Text as="p" variant="body-medium" role="status">
          Listo: guardamos <strong>{result.added}</strong> canciones en una playlist privada de tu cuenta
          {result.missing > 0 ? ` (${result.missing} no estaban disponibles en Spotify)` : ''}.
        </Text>
      ) : working ? (
        <div className={styles.progress} role="status">
          <CircularProgress size={40} label="Creando playlist" />
          <Text variant="body-medium">{progressMessage(progress)}</Text>
        </div>
      ) : (
        <div className={styles.form}>
          <Text as="p" variant="body-medium">
            {intro}
          </Text>
          {phase === 'error' && (
            <Text as="p" variant="body-medium" color="error" role="alert">
              {friendlyError(error)}
            </Text>
          )}
          <TextField label="Nombre de la playlist" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} />
        </div>
      )}
    </Dialog>
  )
}

/**
 * Diálogo para guardar una playlist en Spotify. No sabe de dónde salen las canciones: `build` lo resuelve.
 *
 *   <CreatePlaylistDialog
 *     open={abierto}
 *     onClose={() => setAbierto(false)}
 *     defaultName="Mood · Día de lluvia"
 *     description="Creada con Set The Mood."
 *     intro={<>Guardamos esta lista en tu Spotify como playlist privada.</>}
 *     build={({ name, description, signal, onProgress }) => savePlaylist({ candidates, name, description, signal, onProgress })}
 *   />
 *
 * `build` tiene que devolver { playlist: { url }, added, missing }.
 * Se vuelve a montar cada vez que se abre, así siempre arranca limpio.
 */
export default function CreatePlaylistDialog(props) {
  return <PlaylistDialog key={props.open ? 'open' : 'closed'} {...props} />
}

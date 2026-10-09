import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth.js'
import useLogin from '../../../hooks/useLogin.js'
import { savePlaylist } from '../../../services/playlist.js'
import { AsyncBoundary, Button, EmptyState } from '../../ui'
import CreatePlaylistDialog from '../CreatePlaylistDialog/CreatePlaylistDialog.jsx'
import PlaylistPreview, { PlaylistPreviewSkeleton } from '../PlaylistPreview/PlaylistPreview.jsx'

/**
 * Resultado de armar una playlist: la carga, la vista previa y el guardado en Spotify.
 * Lo comparten "Set the mood" y "Mezclar".
 *
 *   <PlaylistResult result={useAsyncData(…)}  // result.data = { tracks, … }
 *                   title="Mood · Día de lluvia" tags={['rainy day']}
 *                   getNote={(data) => 'Artistas puente: …'}
 *                   onReshuffle={() => setSeed((s) => s + 1)} />
 */
export default function PlaylistResult({ result, title, tags, getNote, onReshuffle }) {
  const { isAuthenticated } = useAuth()
  const { login, loading: loggingIn } = useLogin()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <AsyncBoundary
        result={result}
        skeleton={<PlaylistPreviewSkeleton />}
        isEmpty={(data) => !data || data.tracks.length === 0}
        empty={
          <EmptyState
            icon="queueMusic"
            title="No encontramos canciones"
            description="Last.fm no tiene suficiente música para esa combinación. Probá con otros moods o artistas."
            action={
              <Button variant="tonal" icon="refresh" onClick={onReshuffle}>
                Probar otra tanda
              </Button>
            }
          />
        }
      >
        {(data) => (
          <PlaylistPreview
            title={title}
            tags={tags}
            tracks={data.tracks}
            note={getNote?.(data)}
            onReshuffle={onReshuffle}
            canSave={isAuthenticated}
            onSave={() => setDialogOpen(true)}
            signInAction={
              <Button variant="tonal" icon="playlistAdd" loading={loggingIn} onClick={login}>
                Ingresá para guardarla
              </Button>
            }
          />
        )}
      </AsyncBoundary>

      {isAuthenticated && result.data && (
        <CreatePlaylistDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          defaultName={title}
          description="Creada con Set The Mood."
          intro={
            <>
              Guardamos estas <strong>{result.data.tracks.length}</strong> canciones en una playlist privada de tu
              Spotify.
            </>
          }
          build={(options) => savePlaylist({ candidates: result.data.tracks, ...options })}
        />
      )}
    </>
  )
}

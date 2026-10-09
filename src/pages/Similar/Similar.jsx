import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import {
  ArtistCard,
  CreatePlaylistDialog,
  SeedHeader,
  TopTracksSkeleton,
  TrackListItem,
} from '../../components/features'
import {
  AsyncBoundary,
  Button,
  CardGrid,
  CardGridItem,
  EmptyState,
  List,
  Skeleton,
} from '../../components/ui'
import { useAuth } from '../../hooks/useAuth.js'
import useAsyncData from '../../hooks/useAsyncData.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import useGoBack from '../../hooks/useGoBack.js'
import useLogin from '../../hooks/useLogin.js'
import { getSimilarArtists, getSimilarTracks } from '../../services/lastfm.js'
import { buildSimilarPlaylist } from '../../services/playlist.js'
import { formatMatch } from '../../utils/format.js'
import styles from './Similar.module.css'

const defaultNameFor = (seed) =>
  seed.type === 'track' ? `Similar a ${seed.name} · ${seed.artist}` : `Similar a ${seed.name}`

/** Artistas o canciones similares a uno de partida, con opción de guardarlos como playlist. */
export default function Similar() {
  const [params] = useSearchParams()
  const type = params.get('type') === 'track' ? 'track' : 'artist'
  const name = params.get('name') ?? ''
  const artist = params.get('artist') ?? ''

  const { isAuthenticated } = useAuth()
  const { login, loading: loggingIn } = useLogin()
  const goBack = useGoBack('/buscar')
  const [dialogOpen, setDialogOpen] = useState(false)

  useDocumentTitle(name ? `Similares a ${name}` : 'Similares')

  const similar = useAsyncData(
    ({ signal }) =>
      type === 'track'
        ? getSimilarTracks(artist, name, { signal })
        : getSimilarArtists(name, { signal }),
    `similar:${type}:${name}:${artist}`,
    { enabled: Boolean(name), cache: true },
  )

  if (!name) return <Navigate to="/buscar" replace />

  const seed = { type, name, artist }
  const hasResults = Array.isArray(similar.data) && similar.data.length > 0

  const playlistAction = isAuthenticated ? (
    <Button icon="playlistAdd" disabled={!hasResults} onClick={() => setDialogOpen(true)}>
      Crear playlist en Spotify
    </Button>
  ) : (
    <Button variant="tonal" icon="playlistAdd" loading={loggingIn} onClick={login}>
      Ingresá para crear una playlist
    </Button>
  )

  const skeleton =
    type === 'artist' ? (
      <CardGrid aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <CardGridItem key={index}>
            <Skeleton height={190} />
          </CardGridItem>
        ))}
      </CardGrid>
    ) : (
      <TopTracksSkeleton count={10} />
    )

  return (
    <>
      <div className={styles.back}>
        <Button variant="text" icon="arrowBack" onClick={goBack}>
          Volver
        </Button>
      </div>

      <SeedHeader seed={seed} actions={playlistAction} />

      <AsyncBoundary
        result={similar}
        skeleton={skeleton}
        empty={
          <EmptyState
            icon="search"
            title="Todavía no hay similares"
            description="Last.fm no tiene suficientes datos de esto. Probá con otro artista o canción."
            action={
              <Button variant="tonal" to="/buscar">
                Buscar otra cosa
              </Button>
            }
          />
        }
      >
        {(items) =>
          type === 'artist' ? (
            <CardGrid>
              {items.map((item) => (
                <CardGridItem key={item.id}>
                  <ArtistCard artist={item} subtitle={`${formatMatch(item.match)} similar`} />
                </CardGridItem>
              ))}
            </CardGrid>
          ) : (
            <List aria-label="Canciones similares">
              {items.map((item) => (
                <TrackListItem key={item.id} track={item} extraSupporting={`${formatMatch(item.match)} similar`} />
              ))}
            </List>
          )
        }
      </AsyncBoundary>

      {isAuthenticated && (
        <CreatePlaylistDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          defaultName={defaultNameFor(seed)}
          description={`Creada con Set The Mood a partir de "${seed.name}".`}
          intro={
            <>
              Armamos una playlist privada con música parecida a <strong>{seed.name}</strong> y la guardamos en tu
              Spotify.
            </>
          }
          build={(options) => buildSimilarPlaylist({ seed, ...options })}
        />
      )}
    </>
  )
}

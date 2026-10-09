import { useState } from 'react'
import {
  LastfmUserForm,
  PeriodFilter,
  RecentArtistsRow,
  RecentArtistsSkeleton,
  TopTracksList,
  TopTracksSkeleton,
} from '../../components/features'
import { PageHeader, Section } from '../../components/layout'
import { AsyncBoundary, Banner, Button, EmptyState } from '../../components/ui'
import { DEFAULT_PERIOD } from '../../config/constants.js'
import { useAuth } from '../../hooks/useAuth.js'
import useAsyncData from '../../hooks/useAsyncData.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import useScrollMemory from '../../hooks/useScrollMemory.js'
import useLastfmUser from '../../hooks/useLastfmUser.js'
import useLogin from '../../hooks/useLogin.js'
import { getRecentArtists, getTopTracks } from '../../services/lastfm.js'

/** Dashboard: últimos artistas escuchados y canciones más escuchadas (datos de Last.fm). */
export default function Dashboard() {
  useDocumentTitle('Mi música')
  useScrollMemory()
  const { isDemo, profile } = useAuth()
  const { login, loading: loggingIn } = useLogin()
  const [username, setUsername] = useLastfmUser(isDemo)
  const [editing, setEditing] = useState(false)
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const hasUser = Boolean(username)

  const recent = useAsyncData(
    ({ signal }) => getRecentArtists(username, { signal }),
    `recent:${username}`,
    { enabled: hasUser, cache: true },
  )
  const top = useAsyncData(
    ({ signal }) => getTopTracks(username, period, { signal }),
    `top:${username}:${period}`,
    { enabled: hasUser, cache: true },
  )

  const greeting = isDemo ? 'Explorá Set The Mood' : `Hola, ${profile?.displayName ?? 'bienvenidx'}`

  if (!hasUser || editing) {
    return (
      <>
        <PageHeader title={greeting} subtitle="Primero, indicá de qué perfil de Last.fm querés ver la música." />
        <LastfmUserForm
          initialValue={username}
          onCancel={hasUser ? () => setEditing(false) : undefined}
          onSubmit={(name) => {
            setUsername(name)
            setEditing(false)
          }}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={greeting}
        subtitle={`Historial de ${username} en Last.fm`}
        actions={
          <Button variant="tonal" icon="edit" onClick={() => setEditing(true)}>
            Cambiar usuario
          </Button>
        }
      />

      {isDemo && (
        <Banner
          action={
            <Button variant="text" loading={loggingIn} onClick={login}>
              Ingresar con Spotify
            </Button>
          }
        >
          Estás en el modo demo, con un perfil público de Last.fm. Ingresá con Spotify para ver las portadas y guardar
          playlists en tu cuenta.
        </Banner>
      )}

      <Section title="Últimos artistas escuchados" subtitle="Tocá un artista para descubrir música parecida">
        <AsyncBoundary
          result={recent}
          skeleton={<RecentArtistsSkeleton />}
          empty={
            <EmptyState
              icon="musicNote"
              title="Todavía no hay historial"
              description="Last.fm no tiene canciones recientes para este usuario. Escuchá algo con el scrobbling activado y volvé."
            />
          }
        >
          {(artists) => <RecentArtistsRow artists={artists} />}
        </AsyncBoundary>
      </Section>

      <Section title="Tus canciones más escuchadas" subtitle="Elegí el período que quieras repasar">
        <PeriodFilter value={period} onChange={setPeriod} />
        <AsyncBoundary
          result={top}
          skeleton={<TopTracksSkeleton />}
          empty={
            <EmptyState
              icon="queueMusic"
              title="Sin canciones en este período"
              description="Probá con un período más largo."
            />
          }
        >
          {(tracks) => <TopTracksList tracks={tracks} />}
        </AsyncBoundary>
      </Section>
    </>
  )
}

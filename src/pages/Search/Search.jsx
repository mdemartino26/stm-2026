import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchResults, TopTracksSkeleton } from '../../components/features'
import { PageHeader } from '../../components/layout'
import {
  AsyncBoundary,
  Banner,
  Button,
  CardGrid,
  CardGridItem,
  EmptyState,
  SearchBar,
  SegmentedButton,
  Skeleton,
} from '../../components/ui'
import { SEARCH_TYPES } from '../../config/constants.js'
import { useAuth } from '../../hooks/useAuth.js'
import useAsyncData from '../../hooks/useAsyncData.js'
import useDebouncedValue from '../../hooks/useDebouncedValue.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import useScrollMemory from '../../hooks/useScrollMemory.js'
import useLogin from '../../hooks/useLogin.js'
import { searchCatalog } from '../../services/catalog.js'
import styles from './Search.module.css'

const MIN_QUERY_LENGTH = 2

/** Buscador de artistas y canciones (Spotify con sesión, Last.fm en modo demo). */
export default function Search() {
  useDocumentTitle('Descubrir')
  useScrollMemory()
  const { isDemo } = useAuth()
  const { login, loading: loggingIn } = useLogin()
  const [params, setParams] = useSearchParams()

  const type = params.get('type') === 'track' ? 'track' : 'artist'
  const [text, setText] = useState(params.get('q') ?? '')
  const query = useDebouncedValue(text.trim(), 450)
  const enabled = query.length >= MIN_QUERY_LENGTH
  const source = isDemo ? 'lastfm' : 'spotify'

  // La búsqueda vive en la URL: al volver desde "similares" se recuperan texto y tipo.
  const updateParams = (changes) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )

  const handleText = (value) => {
    setText(value)
    updateParams({ q: value.trim() })
  }

  const results = useAsyncData(
    ({ signal }) => searchCatalog({ type, query, source, signal }),
    `search:${source}:${type}:${query}`,
    { enabled, cache: true },
  )

  const typing = text.trim() !== query
  const noun = type === 'artist' ? 'artistas' : 'canciones'

  const skeleton =
    type === 'artist' ? (
      <CardGrid aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <CardGridItem key={index}>
            <Skeleton height={190} />
          </CardGridItem>
        ))}
      </CardGrid>
    ) : (
      <TopTracksSkeleton />
    )

  return (
    <>
      <PageHeader
        align="center"
        title="Descubrí música nueva"
        subtitle="Buscá un artista o una canción y encontrá música parecida."
      />

      {isDemo && (
        <Banner
          action={
            <Button variant="text" loading={loggingIn} onClick={login}>
              Ingresar con Spotify
            </Button>
          }
        >
          En modo demo la búsqueda usa Last.fm y no muestra portadas. Ingresá con Spotify para ver las imágenes.
        </Banner>
      )}

      <div className={styles.controls}>
        <SearchBar
          className={styles.searchBar}
          value={text}
          onChange={handleText}
          label={`Buscar ${noun}`}
          placeholder={type === 'artist' ? 'Buscar un artista' : 'Buscar una canción'}
          loading={enabled && (typing || results.loading)}
        />
        <SegmentedButton
          label="Qué buscar"
          value={type}
          options={SEARCH_TYPES}
          onChange={(value) => updateParams({ type: value })}
        />
      </div>

      {!enabled ? (
        <EmptyState
          icon="explore"
          title="Empezá escribiendo"
          description={`Escribí al menos ${MIN_QUERY_LENGTH} letras para buscar ${noun}.`}
        />
      ) : (
        <AsyncBoundary
          result={results}
          skeleton={skeleton}
          empty={
            <EmptyState
              icon="search"
              title="Sin resultados"
              description={`No encontramos ${noun} para “${query}”. Probá con otro nombre.`}
            />
          }
        >
          {(items) => <SearchResults type={type} items={items} />}
        </AsyncBoundary>
      )}
    </>
  )
}

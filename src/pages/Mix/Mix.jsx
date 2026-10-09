import { useEffect, useRef } from 'react'
import { ArtistPicker, ListeningFilters, PlaylistResult } from '../../components/features'
import { PageHeader, StepCard } from '../../components/layout'
import { Banner, Button } from '../../components/ui'
import { STORAGE_KEYS } from '../../config/constants.js'
import { useAuth } from '../../hooks/useAuth.js'
import useAsyncData from '../../hooks/useAsyncData.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import useListeningFilters from '../../hooks/useListeningFilters.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import useScrollMemory from '../../hooks/useScrollMemory.js'
import { collectArtistMixTracks } from '../../services/moodMix.js'
import styles from './Mix.module.css'

const MIN_ARTISTS = 2
const MAX_ARTISTS = 3

/** Lo que se guarda al salir de la pantalla, para encontrarla igual al volver. */
const INITIAL_FORM = {
  artists: [],
  request: null, // foto de los artistas y filtros al apretar "Mezclar"
  seed: 0,
}

const noteFor = ({ bridges }) =>
  bridges.length > 0
    ? `Artistas que conectan lo que elegiste: ${bridges.slice(0, 5).join(', ')}.`
    : 'No encontramos artistas en común, así que mezclamos música parecida a cada uno.'

/** Elegís 2 o 3 artistas y la playlist sale del cruce de sus similares. */
export default function Mix() {
  useDocumentTitle('Mezclar artistas')
  useScrollMemory()
  const { isDemo } = useAuth()
  const resultRef = useRef(null)
  const scrollToResultRef = useRef(false)
  const filtersState = useListeningFilters()
  const { filters } = filtersState
  const source = isDemo ? 'lastfm' : 'spotify'

  const [form, setForm] = usePersistentState(STORAGE_KEYS.mixForm, INITIAL_FORM)
  const { artists, request, seed } = form

  const add = (name) =>
    setForm((current) =>
      current.artists.length >= MAX_ARTISTS || current.artists.some((item) => item.toLowerCase() === name.toLowerCase())
        ? current
        : { ...current, artists: [...current.artists, name] },
    )
  const remove = (name) => setForm((current) => ({ ...current, artists: current.artists.filter((item) => item !== name) }))

  const generate = () => {
    scrollToResultRef.current = true
    setForm((current) => ({
      ...current,
      seed: 0,
      request: {
        artists,
        excludedGenreTags: filters.genres.flatMap((genre) => genre.tags),
        excludedArtists: filters.artists,
        title: `Mezcla · ${artists.join(' + ')}`,
      },
    }))
  }

  // Al mezclar se baja hasta el resultado (no al volver a la pantalla: ahí se restaura el scroll)
  useEffect(() => {
    if (request && scrollToResultRef.current) {
      scrollToResultRef.current = false
      resultRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [request])

  const result = useAsyncData(
    ({ signal }) =>
      collectArtistMixTracks(request.artists, {
        seed,
        excludedGenreTags: request.excludedGenreTags,
        excludedArtists: request.excludedArtists,
        signal,
      }),
    `mix:${request ? JSON.stringify([request.artists, request.excludedGenreTags, request.excludedArtists, seed]) : ''}`,
    { enabled: Boolean(request), cache: true },
  )

  return (
    <div className={styles.column}>
      <PageHeader
        align="center"
        eyebrow="Mezclar"
        title="Mezclá artistas"
        subtitle={`Elegí ${MIN_ARTISTS} o ${MAX_ARTISTS} artistas y armamos una playlist con lo que tienen en común.`}
      />

      {isDemo && (
        <Banner>En el modo demo la búsqueda usa Last.fm y no muestra fotos. Ingresá con Spotify para verlas y guardar la playlist.</Banner>
      )}

      <StepCard step={1} title="Elegí tus artistas" subtitle={`Buscalos y sumá entre ${MIN_ARTISTS} y ${MAX_ARTISTS}.`}>
        <ArtistPicker selected={artists} max={MAX_ARTISTS} source={source} onAdd={add} onRemove={remove} />
      </StepCard>

      <ListeningFilters {...filtersState} source={source} />

      <div className={styles.cta}>
        <Button size="md" icon="shuffle" disabled={artists.length < MIN_ARTISTS} onClick={generate}>
          Mezclar
        </Button>
      </div>

      {request && (
        <div ref={resultRef} className={styles.result}>
          <PlaylistResult
            result={result}
            title={request.title}
            tags={request.artists}
            getNote={noteFor}
            onReshuffle={() => setForm((current) => ({ ...current, seed: current.seed + 1 }))}
          />
        </div>
      )}
    </div>
  )
}

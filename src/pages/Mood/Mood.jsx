import { useEffect, useMemo, useRef } from 'react'
import { MoodPicker, PlaylistResult } from '../../components/features'
import { PageHeader, StepCard } from '../../components/layout'
import { Banner, Button, ChipGroup, FilterChip, TextArea } from '../../components/ui'
import { STORAGE_KEYS } from '../../config/constants.js'
import { MOODS_BY_ID, EXAMPLE_PHRASES } from '../../data/moods.js'
import { useAuth } from '../../hooks/useAuth.js'
import useAsyncData from '../../hooks/useAsyncData.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import useListeningFilters from '../../hooks/useListeningFilters.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import useScrollMemory from '../../hooks/useScrollMemory.js'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import { interpretMood, playlistNameForMoods, tagsForGenres, tagsForMoods } from '../../services/moodInterpreter.js'
import { collectMoodTracks } from '../../services/moodMix.js'
import styles from './Mood.module.css'

const MAX_SOFT = 4
const MAX_GENRES = 3
const MAX_TEXT = 240

/** Lo que se guarda al salir de la pantalla, para encontrarla igual al volver. */
const INITIAL_FORM = {
  text: '',
  added: [], // moods y géneros sumados a mano (objetos completos)
  dismissed: [], // ids quitados a mano
  dismissedAvoided: [], // géneros a evitar (pedidos en el texto) que se quitaron
  request: null, // foto de todo al apretar "Armar playlist"
  seed: 0, // otra tanda con los mismos datos
}

const unique = (items, key = (item) => item) => [...new Map(items.map((item) => [key(item), item])).values()]

/** Nota bajo el título de la playlist: qué se respetó y qué se evitó. */
function noteFor(request, data) {
  const parts = []
  if (request.genres.length > 0) {
    const names = request.genres.map((genre) => genre.label).join(' y ')
    parts.push(`Todas las canciones son de ${names}.`)
    if (request.softTags.length > 0) {
      parts.push(
        data.exactMatches > 0
          ? `${data.exactMatches} también están etiquetadas con tu mood; el resto son del género ordenadas por cercanía.`
          : 'Ordenadas por cercanía con tu mood.',
      )
    }
  }
  if (request.avoidedGenres.length > 0 || request.excludedArtists.length > 0) {
    const avoided = [...request.avoidedGenres.map((genre) => genre.label), ...request.excludedArtists]
    parts.push(`Sin: ${avoided.join(', ')}.`)
  }
  return parts.join(' ') || undefined
}

/**
 * Pantalla principal: el usuario cuenta cómo está, la app interpreta el texto en moods y géneros,
 * busca música con esos tags en Last.fm y la guarda como playlist privada en Spotify.
 *  - Un género se respeta al 100%: si hay uno, todas las canciones son de ese género.
 *  - Los géneros y artistas a evitar se dejan siempre afuera.
 * Al ir a "similares" y volver, el texto, la selección, la playlist y el scroll siguen donde estaban.
 */
export default function Mood() {
  useDocumentTitle('Set the mood')
  useScrollMemory()
  const { isDemo } = useAuth()
  const { show } = useSnackbar()
  const resultRef = useRef(null)
  const scrollToResultRef = useRef(false)
  const filtersState = useListeningFilters()
  const { filters } = filtersState
  const source = isDemo ? 'lastfm' : 'spotify'

  const [form, setForm] = usePersistentState(STORAGE_KEYS.moodForm, INITIAL_FORM)
  const { text, added, dismissed, dismissedAvoided, request, seed } = form
  const patch = (changes) => setForm((current) => ({ ...current, ...changes }))

  const interpretation = useMemo(() => interpretMood(text), [text])

  // Moods y géneros = los que detecta el texto + los sumados a mano - los quitados
  const moods = useMemo(() => {
    const merged = unique([...interpretation.moods, ...added], (mood) => mood.id).filter((mood) => !dismissed.includes(mood.id))
    const genres = merged.filter((mood) => mood.kind === 'genre').slice(0, MAX_GENRES)
    const soft = merged.filter((mood) => mood.kind !== 'genre').slice(0, MAX_SOFT)
    return [...genres, ...soft]
  }, [interpretation, added, dismissed])

  // Géneros a evitar = los que pide el texto ("sin reggaetón") + los guardados en los filtros
  const avoidedGenres = useMemo(
    () => [
      ...interpretation.excludedGenres
        .filter((genre) => !dismissedAvoided.includes(genre.id))
        .map((genre) => ({ id: genre.id, label: genre.label, tags: genre.tags, source: 'text' })),
      ...filters.genres.map((genre) => ({ ...genre, source: 'saved' })),
    ],
    [interpretation, dismissedAvoided, filters.genres],
  )

  const addMood = (mood) => {
    const isGenre = mood.kind === 'genre'
    const count = moods.filter((item) => (item.kind === 'genre') === isGenre).length
    if (count >= (isGenre ? MAX_GENRES : MAX_SOFT)) {
      show(isGenre ? `Podés combinar hasta ${MAX_GENRES} géneros` : `Podés combinar hasta ${MAX_SOFT} moods`)
      return
    }
    setForm((current) => ({
      ...current,
      dismissed: current.dismissed.filter((id) => id !== mood.id),
      added: unique([...current.added, { id: mood.id, label: mood.label, kind: mood.kind, tags: mood.tags, score: 0 }], (item) => item.id),
    }))
  }

  const removeMood = (id) =>
    setForm((current) => ({
      ...current,
      added: current.added.filter((item) => item.id !== id),
      dismissed: [...new Set([...current.dismissed, id])],
    }))

  const toggleSuggested = (id) => (moods.some((mood) => mood.id === id) ? removeMood(id) : addMood(MOODS_BY_ID[id]))

  const removeAvoidedGenre = (genre) =>
    genre.source === 'saved'
      ? filtersState.removeGenre(genre.id)
      : setForm((current) => ({ ...current, dismissedAvoided: [...new Set([...current.dismissedAvoided, genre.id])] }))

  const generate = () => {
    const genres = moods.filter((mood) => mood.kind === 'genre')
    const soft = moods.filter((mood) => mood.kind !== 'genre')
    scrollToResultRef.current = true
    patch({
      seed: 0,
      request: {
        genres,
        avoidedGenres,
        excludedArtists: filters.artists,
        genreTags: tagsForGenres(genres),
        softTags: tagsForMoods(soft),
        excludedGenreTags: avoidedGenres.flatMap((genre) => genre.tags),
        title: playlistNameForMoods(moods),
      },
    })
  }

  // Al armar la playlist se baja hasta el resultado (no al volver a la pantalla: ahí se restaura el scroll)
  useEffect(() => {
    if (request && scrollToResultRef.current) {
      scrollToResultRef.current = false
      resultRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [request])

  const requestKey = request
    ? JSON.stringify([request.genreTags, request.softTags, request.excludedGenreTags, request.excludedArtists, seed])
    : null
  const result = useAsyncData(
    ({ signal }) =>
      collectMoodTracks({
        moodTags: request.softTags,
        genreTags: request.genreTags,
        excludedGenreTags: request.excludedGenreTags,
        excludedArtists: request.excludedArtists,
        seed,
        signal,
      }),
    `mood:${requestKey}`,
    { enabled: Boolean(request), cache: true },
  )

  return (
    <div className={styles.column}>
      <PageHeader
        align="center"
        eyebrow="Set the mood"
        title="¿Cómo te sentís hoy?"
        subtitle="Contalo con tus palabras y armamos una playlist para ese momento."
      />

      {isDemo && (
        <Banner>
          Estás en el modo demo: podés armar la lista y ver qué canciones trae. Para guardarla en Spotify, ingresá con tu
          cuenta.
        </Banner>
      )}

      <StepCard step={1} title="Contá cómo estás" subtitle="Podés nombrar un género (“hyperpop”) o descartarlo (“sin reggaetón”).">
        <TextArea
          label="Tu mood"
          value={text}
          onChange={(event) => patch({ text: event.target.value })}
          placeholder={EXAMPLE_PHRASES[0]}
          maxLength={MAX_TEXT}
          rows={3}
          supportingText="En español o en inglés."
        />
        <div className={styles.examples}>
          <ChipGroup label="Frases de ejemplo">
            {EXAMPLE_PHRASES.map((phrase) => (
              <FilterChip key={phrase} onClick={() => patch({ text: phrase })}>
                {phrase}
              </FilterChip>
            ))}
          </ChipGroup>
        </div>
      </StepCard>

      <StepCard step={2} title="Afiná tu playlist" subtitle="Revisá lo que entendimos y sumá o quitá lo que quieras.">
        <MoodPicker
          moods={moods}
          hasText={Boolean(text.trim())}
          avoidedGenres={avoidedGenres}
          filtersState={filtersState}
          source={source}
          onToggleMood={toggleSuggested}
          onRemoveMood={removeMood}
          onAddGenre={addMood}
          onRemoveAvoidedGenre={removeAvoidedGenre}
        />
      </StepCard>

      <div className={styles.cta}>
        <Button size="md" icon="autoAwesome" disabled={moods.length === 0} onClick={generate}>
          Armar playlist
        </Button>
      </div>

      {request && (
        <div ref={resultRef} className={styles.result}>
          <PlaylistResult
            result={result}
            title={request.title}
            tags={[...request.genreTags, ...request.softTags]}
            getNote={(data) => noteFor(request, data)}
            onReshuffle={() => patch({ seed: seed + 1 })}
          />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { SUGGESTED_GENRE_IDS, GENRES_BY_ID } from '../../../data/genres.js'
import { MOODS_BY_ID, SUGGESTED_MOOD_IDS } from '../../../data/moods.js'
import { ChipGroup, FilterChip, InputChip, TabPanel, Tabs, Text } from '../../ui'
import GenreInput from '../GenreInput/GenreInput.jsx'
import { AvoidControls } from '../ListeningFilters/ListeningFilters.jsx'
import styles from './MoodPicker.module.css'

const GENRE_SUGGESTIONS = SUGGESTED_GENRE_IDS.map((id) => GENRES_BY_ID[id])
const MAX_MOODS = 4
const MAX_GENRES = 3

/**
 * Resume lo que la app entendió y deja ajustarlo, en dos partes:
 *  1. "Tu selección": todo junto (moods, géneros y lo que se evita), cada cosa con su ícono y se quita con la ✕.
 *  2. Pestañas para sumar: Moods · Géneros (se respetan al 100%) · Evitar.
 *
 *   <MoodPicker moods={moods} hasText avoidedGenres={[…]} filtersState={useListeningFilters()}
 *               onToggleMood={…} onRemoveMood={…} onAddGenre={…} onRemoveAvoidedGenre={…} source="spotify" />
 */
export default function MoodPicker({
  moods,
  hasText,
  avoidedGenres,
  filtersState,
  onToggleMood,
  onRemoveMood,
  onAddGenre,
  onRemoveAvoidedGenre,
  source,
}) {
  const [tab, setTab] = useState('moods')
  const soft = moods.filter((mood) => mood.kind !== 'genre')
  const genres = moods.filter((mood) => mood.kind === 'genre')
  const activeIds = new Set(moods.map((mood) => mood.id))
  const avoidCount = avoidedGenres.length + filtersState.filters.artists.length

  const selection = [
    ...genres.map((genre) => ({ key: `g:${genre.id}`, icon: 'musicNote', label: genre.label, removeLabel: `Quitar ${genre.label}`, onRemove: () => onRemoveMood(genre.id) })),
    ...soft.map((mood) => ({ key: `m:${mood.id}`, icon: 'mood', label: mood.label, removeLabel: `Quitar ${mood.label}`, onRemove: () => onRemoveMood(mood.id) })),
    ...avoidedGenres.map((genre) => ({ key: `ag:${genre.source}:${genre.id}`, icon: 'block', label: `Sin ${genre.label}`, removeLabel: `Dejar de evitar ${genre.label}`, onRemove: () => onRemoveAvoidedGenre(genre) })),
    ...filtersState.filters.artists.map((name) => ({ key: `aa:${name}`, icon: 'block', label: `Sin ${name}`, removeLabel: `Dejar de evitar ${name}`, onRemove: () => filtersState.removeArtist(name) })),
  ]

  return (
    <div className={styles.picker}>
      <div className={styles.selection} aria-live="polite">
        <Text as="h3" variant="title-small" color="on-surface-variant">
          Tu selección
        </Text>
        {selection.length > 0 ? (
          <ChipGroup label="Tu selección" wrap>
            {selection.map((item) => (
              <InputChip key={item.key} icon={item.icon} onRemove={item.onRemove} removeLabel={item.removeLabel}>
                {item.label}
              </InputChip>
            ))}
          </ChipGroup>
        ) : (
          <Text as="p" variant="body-medium" color="on-surface-variant">
            {hasText
              ? 'Todavía no detectamos ningún mood. Probá con otras palabras (por ejemplo “tranquilo”, “fiesta” o “nostalgia”) o sumá uno abajo.'
              : 'Todavía no elegiste nada: escribí arriba o sumá moods y géneros abajo.'}
          </Text>
        )}
      </div>

      <Tabs
        label="Sumar a tu playlist"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'moods', label: 'Moods', badge: `${soft.length}/${MAX_MOODS}` },
          { value: 'genres', label: 'Géneros', badge: `${genres.length}/${MAX_GENRES}` },
          { value: 'avoid', label: 'Evitar', badge: avoidCount || undefined },
        ]}
      >
        <TabPanel value="moods">
          <Text as="p" variant="body-medium" color="on-surface-variant">
            Tocá para sumar o quitar. Podés combinar hasta {MAX_MOODS}.
          </Text>
          <ChipGroup label="Moods sugeridos" wrap>
            {SUGGESTED_MOOD_IDS.map((id) => (
              <FilterChip key={id} selected={activeIds.has(id)} onClick={() => onToggleMood(id)}>
                {MOODS_BY_ID[id].label}
              </FilterChip>
            ))}
          </ChipGroup>
        </TabPanel>

        <TabPanel value="genres">
          <Text as="p" variant="body-medium" color="on-surface-variant">
            Con un género elegido, <strong>todas</strong> las canciones son de ese género y el mood solo las ordena. Sin
            género, mezclamos estilos que encajen con tu mood.
          </Text>
          <GenreInput
            label="Agregar un género"
            helperText="Cualquiera que exista en Last.fm: hyperpop, shoegaze, city pop…"
            suggestions={GENRE_SUGGESTIONS}
            selectedIds={genres.map((genre) => genre.id)}
            onAdd={onAddGenre}
            onRemove={onRemoveMood}
          />
        </TabPanel>

        <TabPanel value="avoid">
          <Text as="p" variant="body-medium" color="on-surface-variant">
            Lo que sumes acá se deja afuera de la playlist y se recuerda para la próxima. También podés escribir “sin
            reggaetón” en tu mood.
          </Text>
          <AvoidControls {...filtersState} source={source} showSelected={false} />
        </TabPanel>
      </Tabs>
    </div>
  )
}

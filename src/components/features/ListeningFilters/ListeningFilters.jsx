import { SUGGESTED_AVOID_GENRE_IDS, GENRES_BY_ID } from '../../../data/genres.js'
import { AssistChip, ChipGroup, Icon, InputChip, Text } from '../../ui'
import ArtistPicker from '../ArtistPicker/ArtistPicker.jsx'
import GenreInput from '../GenreInput/GenreInput.jsx'
import styles from './ListeningFilters.module.css'

const AVOID_SUGGESTIONS = SUGGESTED_AVOID_GENRE_IDS.map((id) => GENRES_BY_ID[id])
const MAX_AVOIDED_ARTISTS = 10

/**
 * Controles para elegir qué géneros y artistas NO se quieren escuchar. Es controlado: el estado
 * vive en `useListeningFilters()`. Con `showSelected={false}` no repite los elegidos (cuando ya se
 * muestran en otro lado, como el resumen de "Set the mood").
 *
 *   <AvoidControls {...useListeningFilters()} source="spotify" />
 */
export function AvoidControls({ filters, addArtist, removeArtist, addGenre, removeGenre, source, showSelected = true }) {
  return (
    <div className={styles.controls}>
      <section className={styles.group} aria-label="Géneros a evitar">
        {showSelected ? (
          <>
            <Text as="h3" variant="title-small" color="on-surface-variant">
              Géneros a evitar
            </Text>
            {filters.genres.length > 0 && (
              <ChipGroup label="Géneros que evitás" wrap>
                {filters.genres.map((genre) => (
                  <InputChip key={genre.id} onRemove={() => removeGenre(genre.id)} removeLabel={`Quitar ${genre.label} de los géneros a evitar`}>
                    {genre.label}
                  </InputChip>
                ))}
              </ChipGroup>
            )}
          </>
        ) : (
          <Text as="h3" variant="title-small" color="on-surface-variant">
            Géneros a evitar
          </Text>
        )}
        <GenreInput
          label="Género a evitar"
          helperText="Por ejemplo: reggaetón, trap, country…"
          groupLabel="Géneros comunes a evitar"
          suggestions={AVOID_SUGGESTIONS}
          selectedIds={filters.genres.map((genre) => genre.id)}
          onAdd={addGenre}
          onRemove={removeGenre}
        />
      </section>

      <section className={styles.group} aria-label="Artistas a evitar">
        <ArtistPicker
          selected={filters.artists}
          max={MAX_AVOIDED_ARTISTS}
          source={source}
          onAdd={addArtist}
          onRemove={removeArtist}
          heading="Artistas a evitar"
          emptyHint="Buscá un artista para dejarlo afuera."
          searchLabel="Buscar un artista a evitar"
          showSelected={showSelected}
        />
      </section>

      <Text as="p" variant="body-small" color="on-surface-variant">
        Para los géneros usamos las canciones y artistas más representativos de Last.fm: deja afuera lo principal, no
        todo el catálogo.
      </Text>
    </div>
  )
}

/** Panel plegable con `AvoidControls` (lo usa "Mezclar"). */
export default function ListeningFilters({ count, ...controls }) {
  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        <Icon name="block" className={styles.icon} />
        <span className={styles.title}>
          <Text as="span" variant="title-medium">
            Lo que no querés escuchar
          </Text>
          <Text as="span" variant="body-small" color="on-surface-variant">
            Géneros y artistas que se dejan afuera de las playlists
          </Text>
        </span>
        {count > 0 && <AssistChip>{count === 1 ? '1 filtro' : `${count} filtros`}</AssistChip>}
        <Icon name="expandMore" className={styles.chevron} />
      </summary>
      <div className={styles.body}>
        <AvoidControls {...controls} />
      </div>
    </details>
  )
}

import { useState } from 'react'
import useArtwork from '../../../hooks/useArtwork.js'
import useAsyncData from '../../../hooks/useAsyncData.js'
import useDebouncedValue from '../../../hooks/useDebouncedValue.js'
import { searchCatalog } from '../../../services/catalog.js'
import { Artwork, AsyncBoundary, ChipGroup, EmptyState, Icon, InputChip, List, ListItem, SearchBar, Skeleton, Text } from '../../ui'
import styles from './ArtistPicker.module.css'

const MIN_QUERY_LENGTH = 2

function ArtistOption({ artist, disabled, onPick }) {
  const fetched = useArtwork('artist', artist.name, '', { enabled: !artist.image })
  return (
    <ListItem
      lines={1}
      leading={<Artwork src={artist.image ?? fetched} name={artist.name} shape="circle" size={40} />}
      headline={artist.name}
      trailing={<Icon name="add" />}
      onClick={() => onPick(artist)}
      disabled={disabled}
    />
  )
}

/**
 * Buscador para elegir artistas (hasta `max`). Los elegidos se ven como chips que se pueden quitar.
 *   <ArtistPicker selected={['Radiohead']} max={3} source="spotify" onAdd={(name) => …} onRemove={(name) => …} />
 * Los textos se pueden cambiar (por ejemplo para "artistas a evitar"):
 *   heading="Artistas a evitar" emptyHint="Todavía no evitás ninguno." searchLabel="Buscar un artista a evitar"
 */
export default function ArtistPicker({
  selected,
  max = 3,
  source,
  onAdd,
  onRemove,
  heading = 'Elegidos',
  emptyHint = `Buscá y sumá entre 2 y ${max} artistas.`,
  searchLabel = 'Buscar un artista para mezclar',
  showSelected = true,
}) {
  const [text, setText] = useState('')
  const query = useDebouncedValue(text.trim(), 400)
  const enabled = query.length >= MIN_QUERY_LENGTH
  const full = selected.length >= max
  const selectedKeys = new Set(selected.map((name) => name.toLowerCase()))

  const results = useAsyncData(
    ({ signal }) => searchCatalog({ type: 'artist', query, source, signal }),
    `picker:${source}:${query}`,
    { enabled },
  )

  const pick = (artist) => {
    onAdd(artist.name)
    setText('')
  }

  return (
    <div className={styles.picker}>
      {showSelected ? (
        <div className={styles.selected}>
          <Text as="h2" variant="title-small" color="on-surface-variant">
            {heading} ({selected.length}/{max})
          </Text>
          {selected.length > 0 ? (
            <ChipGroup label={heading === 'Elegidos' ? 'Artistas elegidos' : heading} wrap>
              {selected.map((name) => (
                <InputChip key={name} onRemove={() => onRemove(name)} removeLabel={`Quitar ${name}`}>
                  {name}
                </InputChip>
              ))}
            </ChipGroup>
          ) : (
            <Text as="p" variant="body-medium" color="on-surface-variant">
              {emptyHint}
            </Text>
          )}
        </div>
      ) : (
        <Text as="h3" variant="title-small" color="on-surface-variant">
          {heading} ({selected.length}/{max})
        </Text>
      )}

      <SearchBar
        value={text}
        onChange={setText}
        label={searchLabel}
        placeholder={full ? 'Ya elegiste el máximo' : 'Buscar un artista'}
        loading={enabled && (text.trim() !== query || results.loading)}
      />

      {enabled && !full && (
        <AsyncBoundary
          result={results}
          skeleton={
            <div className={styles.skeleton} aria-hidden="true">
              <Skeleton height={56} />
              <Skeleton height={56} />
              <Skeleton height={56} />
            </div>
          }
          empty={<EmptyState icon="search" title="Sin resultados" description={`No encontramos artistas para “${query}”.`} />}
        >
          {(items) => (
            <List aria-label="Artistas encontrados">
              {items
                .filter((artist) => !selectedKeys.has(artist.name.toLowerCase()))
                .slice(0, 8)
                .map((artist) => (
                  <ArtistOption key={artist.id} artist={artist} onPick={pick} />
                ))}
            </List>
          )}
        </AsyncBoundary>
      )}
    </div>
  )
}

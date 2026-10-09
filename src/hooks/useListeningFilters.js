import { useCallback, useMemo } from 'react'
import { STORAGE_KEYS } from '../config/constants.js'
import useLocalStorage from './useLocalStorage.js'

const EMPTY = { artists: [], genres: [] }

/**
 * Lo que el usuario NO quiere escuchar (artistas y géneros). Se guarda en el navegador,
 * así vale para "Set the mood" y "Mezclar" y se recuerda la próxima vez.
 *
 *   const { filters, addArtist, removeArtist, addGenre, removeGenre, count } = useListeningFilters()
 *   filters.artists  -> ['Nickelback']
 *   filters.genres   -> [{ id, label, tags }]
 */
export default function useListeningFilters() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEYS.filters, EMPTY)

  const filters = useMemo(
    () => ({
      artists: Array.isArray(stored?.artists) ? stored.artists : [],
      genres: Array.isArray(stored?.genres) ? stored.genres : [],
    }),
    [stored],
  )

  const update = useCallback((changes) => setStored({ ...filters, ...changes }), [filters, setStored])

  const addArtist = useCallback(
    (name) => {
      if (filters.artists.some((item) => item.toLowerCase() === name.toLowerCase())) return
      update({ artists: [...filters.artists, name] })
    },
    [filters, update],
  )
  const removeArtist = useCallback((name) => update({ artists: filters.artists.filter((item) => item !== name) }), [filters, update])

  const addGenre = useCallback(
    (genre) => {
      if (filters.genres.some((item) => item.id === genre.id)) return
      update({ genres: [...filters.genres, { id: genre.id, label: genre.label, tags: genre.tags }] })
    },
    [filters, update],
  )
  const removeGenre = useCallback((id) => update({ genres: filters.genres.filter((item) => item.id !== id) }), [filters, update])

  return { filters, addArtist, removeArtist, addGenre, removeGenre, count: filters.artists.length + filters.genres.length }
}

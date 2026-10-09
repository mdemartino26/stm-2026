import { useRef } from 'react'
import { cn } from '../../../utils/cn.js'
import CircularProgress from '../CircularProgress/CircularProgress.jsx'
import Icon from '../Icon/Icon.jsx'
import IconButton from '../IconButton/IconButton.jsx'
import styles from './SearchBar.module.css'

/**
 * Barra de búsqueda de M3 (56dp, esquinas completas). Es un componente controlado.
 *   <SearchBar value={text} onChange={setText} onSubmit={buscar} placeholder="Buscar artistas" loading={cargando} />
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  label = 'Buscar',
  placeholder = 'Buscar',
  loading = false,
  autoFocus = false,
  className,
}) {
  const inputRef = useRef(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(value)
  }

  const clear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <form role="search" className={cn(styles.bar, className)} onSubmit={handleSubmit}>
      <Icon name="search" className={styles.leading} />
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck="false"
      />
      {loading && <CircularProgress size={24} label="Buscando" className={styles.spinner} />}
      {!loading && value && <IconButton icon="close" label="Borrar búsqueda" onClick={clear} />}
    </form>
  )
}

import { useCallback, useRef, useState } from 'react'
import { session } from '../utils/storage.js'

/**
 * useState que sobrevive a cambiar de pantalla y volver (se guarda en sessionStorage: dura mientras
 * la pestaña esté abierta). Sirve para que, al volver desde "similares", el formulario siga como estaba.
 *
 *   const [form, setForm] = usePersistentState('stm.mood.form', { text: '' })
 *   setForm((current) => ({ ...current, text: 'hola' }))
 *
 * Si lo guardado es un objeto, se completa con los campos nuevos de `initial` (por si cambió la app).
 */
export default function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const saved = session.getJson(key)
    if (saved === null || saved === undefined) return initial
    const isObject = (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
    return isObject(initial) && isObject(saved) ? { ...initial, ...saved } : saved
  })
  const latest = useRef(value)

  const set = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(latest.current) : next
      latest.current = resolved
      setValue(resolved)
      session.setJson(key, resolved)
    },
    [key],
  )

  return [value, set]
}

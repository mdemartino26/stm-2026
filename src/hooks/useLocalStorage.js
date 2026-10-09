import { useCallback, useState } from 'react'
import { local } from '../utils/storage.js'

/** useState que se guarda en localStorage. Con null, undefined o '' borra la clave. */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => local.getJson(key, initialValue))

  const set = useCallback(
    (next) => {
      setValue(next)
      if (next === null || next === undefined || next === '') local.remove(key)
      else local.setJson(key, next)
    },
    [key],
  )

  return [value, set]
}

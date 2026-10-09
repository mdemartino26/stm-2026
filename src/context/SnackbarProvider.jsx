import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Snackbar from '../components/ui/Snackbar/Snackbar.jsx'
import { SnackbarContext } from './snackbarContext.js'

export default function SnackbarProvider({ children }) {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const dismiss = useCallback(() => {
    clearTimeout(timer.current)
    setMessage(null)
  }, [])

  /** show('Texto', { action: { label, onClick }, duration }) */
  const show = useCallback((text, { action, duration = 5000 } = {}) => {
    clearTimeout(timer.current)
    setMessage({ id: Date.now(), text, action })
    timer.current = setTimeout(() => setMessage(null), duration)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar message={message} onDismiss={dismiss} />
    </SnackbarContext.Provider>
  )
}

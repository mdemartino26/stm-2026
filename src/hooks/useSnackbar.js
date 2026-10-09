import { useContext } from 'react'
import { SnackbarContext } from '../context/snackbarContext.js'

export function useSnackbar() {
  const context = useContext(SnackbarContext)
  if (!context) throw new Error('useSnackbar debe usarse dentro de <SnackbarProvider>.')
  return context
}

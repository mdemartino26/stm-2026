import AuthProvider from './context/AuthProvider.jsx'
import SnackbarProvider from './context/SnackbarProvider.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

export default function App() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </SnackbarProvider>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Los estilos globales (tokens, reset) se importan primero: así el CSS de los componentes,
// que viene después en el bundle, puede sobrescribirlos sin pelear por el orden.
import './styles/index.css'
import App from './App.jsx'

// Spotify no acepta "localhost" como Redirect URI: en desarrollo se pasa a la IP de loopback.
if (import.meta.env.DEV && window.location.hostname === 'localhost') {
  window.location.replace(window.location.href.replace('localhost', '127.0.0.1'))
}

// El navegador no restaura el scroll solo: lo hace cada pantalla (useScrollMemory) cuando corresponde
try {
  window.history.scrollRestoration = 'manual'
} catch {
  // algunos navegadores no lo permiten: no pasa nada
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

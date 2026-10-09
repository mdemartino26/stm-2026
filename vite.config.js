import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Spotify no acepta "localhost" como Redirect URI: hay que usar la IP de loopback.
// Por eso el servidor de desarrollo queda fijo en http://127.0.0.1:5173
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})

import { defineConfig } from 'vitest/config'

// Tests de lógica pura (sin DOM): PKCE, normalizadores de Last.fm, limitador de concurrencia, utilidades.
// Está separado de vite.config.js para que `npm run build` nunca dependa de Vitest.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})

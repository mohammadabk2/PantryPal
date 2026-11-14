import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' loads every variable from .env, not only VITE_* ones (those are the only ones sent to the browser).
  const env = loadEnv(mode, process.cwd(), '')

  for (const name of ['VITE_API_URL', 'API_PROXY_TARGET']) {
    if (!env[name]) throw new Error(`Missing ${name}. Copy client/.env.example to client/.env.`)
  }

  return {
    plugins: [react()],
    server: {
      // In dev, forward /api/* to the FastAPI backend so the client can call relative URLs.
      proxy: {
        '/api': env.API_PROXY_TARGET,
      },
    },
  }
})

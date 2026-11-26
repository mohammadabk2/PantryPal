import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' loads every variable from .env, not only VITE_* ones (those are the only ones sent to the browser).
  const env = loadEnv(mode, process.cwd(), '')

  for (const name of ['VITE_API_URL', 'API_PROXY_TARGET']) {
    if (!env[name]) {
      throw new Error(`Missing ${name}. Copy client/.env.example to client/.env.`)
    }
  }

  // Forward /api/* to the backend so the client can call relative URLs.
  const proxy = {
    '/api': {
      target: env.API_PROXY_TARGET,
      changeOrigin: true,
    },
  }

  return {
    plugins: [
      react(),
      // Makes the app installable and lets it open offline. Only active in the
      // production build (npm run build + npm run preview), not in npm run dev.
      VitePWA({
        // A new version installs in the background and is used on the next visit,
        // so nobody gets reloaded in the middle of a form.
        registerType: 'autoUpdate',
        manifest: {
          name: 'PantryPal',
          short_name: 'PantryPal',
          description: 'Track your pantry, waste less food, and shop smarter.',
          theme_color: '#2F6B3F',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          // Generated from public/favicon.svg with:
          //   npx pwa-assets-generator --preset minimal-2023 public/favicon.svg
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Save every file of the built app on install, so it opens with no connection.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          // Any page URL (e.g. /signup) opens the cached app, which then shows the right page.
          navigateFallback: 'index.html',
          // ...except API URLs, which must always reach the server.
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // The tag/restriction choices are the same for everyone: show the saved copy
              // right away (works offline) and refresh it in the background.
              // Personal data (/api/me/..., /api/auth/...) is deliberately never cached,
              // so one person's data can't be shown to the next person on the same device.
              urlPattern: ({ url }) => url.pathname === '/api/preferences/options',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'api-options' },
            },
          ],
        },
      }),
    ],
    server: { proxy },
    // Same proxy for `npm run preview`, so the built app can reach the backend too.
    preview: { proxy },
  }
})
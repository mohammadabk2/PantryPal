/// <reference types="vite/client" />

// Variables from client/.env that the app reads. Only VITE_* ones reach the browser.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

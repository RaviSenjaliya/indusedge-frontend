/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute base URL of the deployed API, including the /api suffix.
   * Leave unset in development to use the Vite dev proxy.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

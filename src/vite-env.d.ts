/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Identifiant de build injecté par vite.config.ts (hash de commit ou horodatage). */
declare const __APP_VERSION__: string;

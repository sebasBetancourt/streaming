/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_HERO_TITLE_ID?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

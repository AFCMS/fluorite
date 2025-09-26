/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/pwa-assets" />

// Define env variables used in the project
// https://vite.dev/guide/env-and-mode.html#intellisense-for-typescript

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_DISABLE_VERCEL_ANALYTICS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// TODO: Remove when no longer needed
// https://developer.mozilla.org/en-US/docs/Web/API/LaunchParams
// These types are not yet included in TypeScript's standard lib as of v4.9

interface LaunchParams {
  files?: FileSystemFileHandle[];
}
interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => Promise<void>): void;
}
interface Window {
  launchQueue?: LaunchQueue;
}

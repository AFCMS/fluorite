/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/pwa-assets" />

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

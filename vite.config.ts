import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { lingui } from "@lingui/vite-plugin";

const pwaConfig: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  strategies: "generateSW",
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB to accommodate MediaInfoModule.wasm
    globPatterns: ["**/*.{js,css,html,wasm,svg,png,ico,webmanifest}"],
  },
  manifest: {
    name: "Fluorite",
    short_name: "Fluorite",
    description: "An elegant PWA video player",
    categories: ["entertainment", "productivity", "utilities", "video"],
    screenshots: [
      {
        src: "fluorite_empty.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Fluorite - No video loaded",
        form_factor: "wide",
      },
    ],
    id: "/",
    start_url: "/",
    display: "standalone",
    orientation: "landscape-primary",
    prefer_related_applications: false,
    related_applications: [],
    dir: "ltr",
    lang: "en",
    theme_color: "#000000",
    icons: [],
    file_handlers: [
      {
        action: "./",
        accept: {
          "video/*": [".mp4", ".mkv", ".webm", ".mov", ".avi", ".flv", ".wmv"],
        },
      },
    ],
    shortcuts: [],
  },
  pwaAssets: {
    preset: "minimal-2023",
    image: "./public/fluorite.svg",
    htmlPreset: "2023",
    includeHtmlHeadLinks: true,
    overrideManifestIcons: true,
    injectThemeColor: true,
  },
};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
    tailwindcss(),
    VitePWA(pwaConfig),
    viteStaticCopy({
      targets: [
        {
          src: path.join(
            import.meta.dirname,
            "node_modules",
            "mediainfo.js",
            "dist",
            "MediaInfoModule.wasm",
          ),
          dest: "",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["mediainfo.js"],
  },
});

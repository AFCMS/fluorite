import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

const pwaConfig: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  strategies: "generateSW",
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
  },
  manifest: {
    name: "Fluorite",
    short_name: "Fluorite",
    description: "",
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
  plugins: [react(), tailwindcss(), VitePWA(pwaConfig)],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

const pwaConfig: Partial<VitePWAOptions> = {
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
    theme_color: "#00a6f4",
    icons: [],
  },
  pwaAssets: {
    htmlPreset: "2023",
    injectThemeColor: true,
    includeHtmlHeadLinks: true,
    image: "./public/vite.svg",
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaConfig)],
});

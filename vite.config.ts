import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { type VitePWAOptions } from "vite-plugin-pwa";

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-expect-error dede
const pwaConfig: Partial<VitePWAOptions> = {
  manifest: {},
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
});

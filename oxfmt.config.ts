import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  sortPackageJson: false,
  sortTailwindcss: true,
  ignorePatterns: [
    "dist",
    "coverage",
    "src/locales/**/*.ts",
    "helm/templates/**",
    "pnpm-lock.yaml",
  ],
  overrides: [
    {
      files: ["*.json"],
      options: {
        tabWidth: 4,
      },
    },
  ],
});

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores, defineConfig } from "eslint/config";
import pluginLingui from "eslint-plugin-lingui";

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "node_modules",
    "src/locales",
    // Avoid linting the ESLint config itself to prevent parserOptions.project resolution issues in CI
    "eslint.config.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
      pluginLingui.configs["flat/recommended"],
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);

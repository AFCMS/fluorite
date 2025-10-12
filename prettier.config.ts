import { type Config } from "prettier";

/**
 * @see https://prettier.io/docs/en/configuration.html
 */
const config: Config = {
  plugins: ["prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.json",
      options: {
        tabWidth: 4,
      },
    },
  ],
};

export default config;

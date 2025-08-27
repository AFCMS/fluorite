/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
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

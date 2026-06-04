/**
 * Shared Prettier config. The Tailwind plugin sorts utility classes; the Astro
 * plugin formats `.astro` files. Keep the Tailwind plugin last (it must run
 * after any other parser plugins).
 */
/** @type {import("prettier").Config} */
export default {
  semi: false,
  singleQuote: false,
  printWidth: 120,
  trailingComma: "es5",
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.astro",
      options: { parser: "astro" },
    },
  ],
}

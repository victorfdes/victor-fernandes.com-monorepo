import { astroConfig } from "@repo/eslint-config/astro"

export default [
  ...astroConfig,
  {
    ignores: ["dist/**", ".astro/**", "worker-configuration.d.ts"],
  },
  // Playwright e2e specs: `boundingBox()`/`viewportSize()` return nullable values
  // that are idiomatically asserted with `!`, and matcher regexes run on trusted,
  // local fixtures rather than user input.
  {
    files: ["e2e/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "sonarjs/slow-regex": "off",
    },
  },
]

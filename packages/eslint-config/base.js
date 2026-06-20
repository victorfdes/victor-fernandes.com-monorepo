import js from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import sonarjs from "eslint-plugin-sonarjs"
import turbo from "eslint-plugin-turbo"
import globals from "globals"
import tseslint from "typescript-eslint"

/**
 * Base flat config shared by every workspace package: type-aware TypeScript
 * linting (strict + stylistic), SonarJS bug/complexity rules, import ordering,
 * and Turbo env hygiene. Framework layers (React, Astro) extend this.
 *
 * Type-aware rules use the TypeScript project service and resolve the nearest
 * tsconfig via `tsconfigRootDir: process.cwd()` — Turbo runs `eslint .` inside
 * each package, so cwd is always the package root.
 */
export const baseConfig = tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "**/.turbo/**",
      "**/storybook-static/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/coverage/**",
    ],
  },

  js.configs.recommended,

  // Type-aware linting for first-party TypeScript sources. The `@typescript-eslint`
  // plugin (registered by these extends) must own every `@typescript-eslint/*` rule.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      // Numbers/booleans interpolated into template literals are intentional.
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowBoolean: true }],
      // `() => setState(x)` shorthand is idiomatic React; don't force a block body.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // This codebase intentionally models props as `type` aliases (incl. unions
      // and `Readonly<>`), which can't always be interfaces.
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },

  // SonarJS: bug patterns + cognitive complexity, mirroring SonarCloud locally.
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { sonarjs },
    rules: {
      ...sonarjs.configs.recommended.rules,
      // Renderers/helpers may legitimately return a union (e.g. string | ReactNode).
      "sonarjs/function-return-type": "off",
    },
  },

  // Plain JS/ESM tooling files: lint, but skip type-aware rules (not in any tsconfig).
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Config & Storybook TS files live outside the build tsconfig; lint them without
  // type information so the TypeScript project service doesn't reject them.
  {
    files: ["**/*.config.{ts,mts,cts}", "**/.storybook/**/*.{ts,tsx}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: { projectService: false, project: false },
    },
  },

  // Project conventions: import hygiene + Turbo env safety (no type info required).
  {
    plugins: { import: importPlugin, turbo },
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "turbo/no-undeclared-env-vars": "error",
      // TypeScript resolves modules; the import plugin's resolver would duplicate that work.
      "import/no-unresolved": "off",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  }
)

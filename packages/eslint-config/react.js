import vitest from "@vitest/eslint-plugin"
import jestDom from "eslint-plugin-jest-dom"
import jsxA11y from "eslint-plugin-jsx-a11y"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import testingLibrary from "eslint-plugin-testing-library"
import globals from "globals"
import { baseConfig } from "./base.js"

/**
 * React layer: extends {@link baseConfig} with the React, Hooks and
 * accessibility rule sets for `.ts`/`.tsx` sources.
 */
export const reactConfig = [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx}"],
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser },
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // The automatic JSX runtime makes the React import unnecessary.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Prose copy contains apostrophes/quotes; escaping them hurts readability.
      "react/no-unescaped-entities": "off",
    },
  },
  // Unit test files: Vitest + Testing Library + jest-dom best practices.
  // Playwright e2e specs (also `*.spec.ts`) live under `e2e/` and are excluded —
  // their `page.*` API would trip Testing Library's `render`-oriented rules.
  {
    files: ["**/*.{test,spec}.{ts,tsx}"],
    ignores: ["**/e2e/**"],
    plugins: { vitest, "testing-library": testingLibrary, "jest-dom": jestDom },
    languageOptions: { globals: { ...vitest.environments.env.globals } },
    rules: {
      ...vitest.configs.recommended.rules,
      ...testingLibrary.configs["flat/react"].rules,
      ...jestDom.configs["flat/recommended"].rules,
    },
    settings: { vitest: { typecheck: true } },
  },
  // No-op handlers are legitimate placeholders in tests and Storybook stories.
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "**/*.stories.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "sonarjs/no-empty-function": "off",
    },
  },
]

import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// Mirror tsconfig `paths` so bare imports like `utils/blog-content` and
// `components/...` resolve the same way they do in the Astro build.
const fromSrc = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      utils: fromSrc("utils"),
      components: fromSrc("components"),
      layouts: fromSrc("layouts"),
      // `astro:env/client` is a virtual module from Astro's build; point it at a stub so
      // modules that read typed env vars can be unit-tested.
      "astro:env/client": fileURLToPath(new URL("./test/stubs/astro-env-client.ts", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // `lcov` feeds SonarCloud (see sonar-project.properties); `text` prints a CI summary.
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Count every source module, not just those a test happened to import.
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/*.stories.tsx",
        "src/**/_data/**",
        "src/content.config.ts",
        "src/**/*.d.ts",
      ],
      // Non-regression floor set just below the current baseline; ratchet upward
      // as tests are added (see CONTRIBUTING). SonarCloud separately gates new code at 80%.
      thresholds: {
        statements: 22,
        branches: 70,
        functions: 48,
        lines: 22,
      },
    },
  },
})

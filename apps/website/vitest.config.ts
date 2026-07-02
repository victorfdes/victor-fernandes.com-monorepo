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
      // `astro:content` is server-only and absent from the test runtime; stub it so the
      // blog loader can be unit-tested (tests drive `getCollection`'s resolved value).
      "astro:content": fileURLToPath(new URL("./test/stubs/astro-content.ts", import.meta.url)),
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
        // Presentational-only components (no branching logic). Their rendering is
        // validated by Playwright e2e, not unit tests — see AGENTS.md "Testing &
        // coverage". Keep this list in sync with sonar.coverage.exclusions.
        "src/components/HeaderBanner.tsx",
        "src/components/VictorBanner.tsx",
        "src/components/Testimonials.tsx",
        "src/components/Header/**",
        // Footer status chips: thin views over `utils/system-status` (unit-tested).
        // Their markup is validated by e2e, not hollow render tests.
        "src/components/Footer/SonarStatus.tsx",
        "src/components/Footer/ScorecardStatus.tsx",
        "src/components/resume/**",
        "src/components/blog/BlogPostList.tsx",
        "src/components/blog/TaxonomyIndex.tsx",
        "src/components/blog/mdx-components.tsx",
        "src/layouts/AppLayout.tsx",
      ],
      // Non-regression floor set just below the current baseline; ratchet upward
      // as tests are added (see CONTRIBUTING). SonarCloud separately gates new code at 80%.
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 97,
        lines: 95,
      },
    },
  },
})

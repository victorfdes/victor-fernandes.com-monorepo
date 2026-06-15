import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
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
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/*.stories.tsx",
        "src/index.ts",
        "src/**/*.d.ts",
        // Presentational-only primitives (a cursor effect and a controlled toggle):
        // exercised in the app's e2e, not worth hollow unit tests. Keep in sync with
        // sonar.coverage.exclusions and AGENTS.md "Testing & coverage".
        "src/Flashlight/**",
        "src/ThemeToggle/**",
      ],
      // Non-regression floor set just below the current baseline; ratchet upward
      // as tests are added (see CONTRIBUTING). SonarCloud separately gates new code at 80%.
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 83,
        lines: 95,
      },
    },
  },
})

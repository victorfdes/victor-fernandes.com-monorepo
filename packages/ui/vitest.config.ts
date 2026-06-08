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
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/*.stories.tsx", "src/index.ts", "src/**/*.d.ts"],
      // Non-regression floor set just below the current baseline; ratchet upward
      // as tests are added (see CONTRIBUTING). SonarCloud separately gates new code at 80%.
      thresholds: {
        statements: 72,
        branches: 85,
        functions: 52,
        lines: 72,
      },
    },
  },
})

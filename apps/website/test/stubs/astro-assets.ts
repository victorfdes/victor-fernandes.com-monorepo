import { vi } from "vitest"

// Test double for Astro's `astro:assets` virtual module, which only exists inside the Astro/Vite
// build (and would otherwise try to reach the CDN and run Sharp). Wired up via the resolve alias in
// vitest.config.ts so the image helpers can be unit-tested. Tests drive the return value with
// `vi.mocked(getImage).mockResolvedValue(...)`.
export const getImage = vi.fn()

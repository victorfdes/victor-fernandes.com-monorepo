import { vi } from "vitest"

// Test double for Astro's server-only `astro:content` virtual module, which only
// exists inside the Astro/Vite build. Wired up via the resolve alias in
// vitest.config.ts so loader modules (e.g. blog-collection) can be unit-tested.
// Tests drive the return value with `vi.mocked(getCollection).mockResolvedValue(...)`.
export const getCollection = vi.fn()

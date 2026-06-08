// Test double for Astro's `astro:env/client` virtual module, which only exists inside the
// Astro/Vite build. Wired up via the resolve alias in vitest.config.ts so unit tests can
// import modules that read typed env vars.
export const PUBLIC_STATIC_HOST_URL = "https://cdn.test.example"

// @ts-check
import { fileURLToPath } from "node:url"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"

// https://astro.build/config
export default defineConfig({
  // Canonical origin — enables the sitemap, RSS absolute URLs and canonical tags.
  site: "https://victor-fernandes.com",

  // Typed, build-validated env vars (see `astro:env`). PUBLIC_STATIC_HOST_URL is the origin
  // for CDN-hosted assets; required (no default) so a misconfigured environment fails the
  // build instead of shipping broken asset URLs.
  env: {
    schema: {
      PUBLIC_STATIC_HOST_URL: envField.string({ context: "client", access: "public" }),
    },
  },

  integrations: [react(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^@repo\/ui$/,
          replacement: fileURLToPath(new URL("../../packages/ui/src/index.ts", import.meta.url)),
        },
      ],
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
    ssr: {
      noExternal: ["@repo/ui"],
    },
  },
})

import { PUBLIC_STATIC_HOST_URL } from "astro:env/client"

// Resolve an asset path against the configured CDN origin, e.g.
// cdnUrl("i/victor-fernandes.jpg") -> "https://static.victor-fernandes.com/i/victor-fernandes.jpg".
export const cdnUrl = (path: string) => new URL(path, PUBLIC_STATIC_HOST_URL).href

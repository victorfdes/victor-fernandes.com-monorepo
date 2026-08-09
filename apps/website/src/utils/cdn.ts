import { PUBLIC_STATIC_HOST_URL } from "astro:env/client"

// Resolve an asset path against the configured CDN origin, e.g.
// cdnUrl("images/48/victor-fernandes.jpeg") -> "https://r2.victor-fernandes.com/images/48/victor-fernandes.jpeg".
// Assets fetched this way (avatars, the resume photo, the resume PDF) are already stored at their
// display size — nothing is resized at request time.
export const cdnUrl = (path: string) => new URL(path, PUBLIC_STATIC_HOST_URL).href

const cdnOrigin = new URL(PUBLIC_STATIC_HOST_URL).origin

// True when `src` lives on our CDN origin, and so may be pulled into the build and pre-resized by
// `astro:assets` (see `blog-images.ts`). Anything else — other hosts, empty strings — is left alone,
// because `image.remotePatterns` in astro.config.mjs only authorises this one origin.
export const isCdnAsset = (src: string) => src.startsWith(`${cdnOrigin}/`)

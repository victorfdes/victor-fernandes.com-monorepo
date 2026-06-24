import { PUBLIC_STATIC_HOST_URL } from "astro:env/client"

// Resolve an asset path against the configured CDN origin, e.g.
// cdnUrl("i/victor-fernandes.jpg") -> "https://static.victor-fernandes.com/i/victor-fernandes.jpg".
export const cdnUrl = (path: string) => new URL(path, PUBLIC_STATIC_HOST_URL).href

const cdnOrigin = new URL(PUBLIC_STATIC_HOST_URL).origin

// True when `src` lives on our CDN origin, so it can be routed through Cloudflare Image
// Transformations (`/cdn-cgi/image/`). Anything else (other hosts, empty strings) is left untouched.
const isTransformable = (src: string) => src.startsWith(`${cdnOrigin}/`)

type CdnImageOptions = { width: number; quality?: number }

// Rewrite a CDN image URL through Cloudflare Image Transformations to serve a resized WebP variant —
// e.g. cdnImage("https://cdn/x.jpg", { width: 480 }) ->
// "https://cdn/cdn-cgi/image/width=480,format=webp,quality=80/x.jpg". Non-CDN URLs pass through.
// WebP (not `format=auto`/AVIF) on purpose: at q80 it matches AVIF's byte size for these hero images
// but decodes far cheaper on the main thread — AVIF's heavier decode of the preloaded LCP image was
// inflating blog Total Blocking Time.
export const cdnImage = (src: string, { width, quality = 80 }: CdnImageOptions) => {
  if (!isTransformable(src)) return src
  const path = src.slice(cdnOrigin.length + 1)
  return `${cdnOrigin}/cdn-cgi/image/width=${width},format=webp,quality=${quality}/${path}`
}

// A `srcset` string over the given candidate widths, or `undefined` when `src` is not a transformable
// CDN URL (so callers can omit `srcset`/`sizes` rather than emit a single-URL set).
export const cdnImageSrcSet = (src: string, widths: readonly number[], quality = 80) =>
  isTransformable(src) ? widths.map((w) => `${cdnImage(src, { width: w, quality })} ${w}w`).join(", ") : undefined

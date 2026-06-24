import { PUBLIC_STATIC_HOST_URL } from "astro:env/client"

// Resolve an asset path against the configured CDN origin, e.g.
// cdnUrl("i/victor-fernandes.jpg") -> "https://static.victor-fernandes.com/i/victor-fernandes.jpg".
export const cdnUrl = (path: string) => new URL(path, PUBLIC_STATIC_HOST_URL).href

const cdnOrigin = new URL(PUBLIC_STATIC_HOST_URL).origin

// True when `src` lives on our CDN origin, so it can be routed through Cloudflare Image
// Transformations (`/cdn-cgi/image/`). Anything else (other hosts, empty strings) is left untouched.
const isTransformable = (src: string) => src.startsWith(`${cdnOrigin}/`)

type CdnImageOptions = { width: number; quality?: number }

// Rewrite a CDN image URL through Cloudflare Image Transformations to serve a resized, modern-format
// (AVIF/WebP via `format=auto`) variant — e.g. cdnImage("https://cdn/x.jpg", { width: 480 }) ->
// "https://cdn/cdn-cgi/image/width=480,format=auto,quality=80/x.jpg". Non-CDN URLs pass through.
export const cdnImage = (src: string, { width, quality = 80 }: CdnImageOptions) => {
  if (!isTransformable(src)) return src
  const path = src.slice(cdnOrigin.length + 1)
  return `${cdnOrigin}/cdn-cgi/image/width=${width},format=auto,quality=${quality}/${path}`
}

// A `srcset` string over the given candidate widths, or `undefined` when `src` is not a transformable
// CDN URL (so callers can omit `srcset`/`sizes` rather than emit a single-URL set).
export const cdnImageSrcSet = (src: string, widths: readonly number[], quality = 80) =>
  isTransformable(src) ? widths.map((w) => `${cdnImage(src, { width: w, quality })} ${w}w`).join(", ") : undefined

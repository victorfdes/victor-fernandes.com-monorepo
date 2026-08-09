import { getImage } from "astro:assets"
import type { BlogImageAttributes } from "./blog"
import { isCdnAsset } from "./cdn"

/**
 * Blog featured images are resized once, at build time. `astro:assets` fetches the original from the
 * CDN, hands it to Sharp and emits content-hashed variants into `_astro/`, which Cloudflare Pages then
 * serves same-origin and immutable (see `public/_headers`). Nothing is transformed per request.
 *
 * This replaced Cloudflare Image Transformations (`/cdn-cgi/image/`). Those produced correct bytes,
 * but inherited the origin object's 30-minute `cache-control`, so every variant fell out of the edge
 * cache twice an hour and paid ~320ms to be re-encoded — on the LCP element of every post.
 *
 * WebP (not AVIF) on purpose: at q80 it matches AVIF's byte size for these hero images but decodes far
 * cheaper on the main thread — AVIF's heavier decode of the preloaded LCP image was inflating blog
 * Total Blocking Time.
 */
const IMAGE_FORMAT = "webp"
const IMAGE_QUALITY = 80

// Blog post hero images render at roughly the full content column — `max-w-7xl`
// minus the `px-8` gutters ≈ 1216px — and go full-bleed on mobile.
// Defining the widths/sizes once keeps the rendered <img> and its <link rel="preload"> requesting
// the exact same bytes, so the preload is reused rather than triggering a second download.
const BLOG_IMAGE_WIDTHS = [400, 640, 800, 1080, 1280, 1920] as const
export const BLOG_IMAGE_SIZES = "(min-width: 1280px) 1216px, calc(100vw - 64px)"
const BLOG_IMAGE_DEFAULT_WIDTH = 800

// Blog index cards are capped at `max-w-sm` (24rem / 384px), so they should not
// request the same full-width image candidates as an article hero. The cards use
// `shadow-hover-box` padding, leaving roughly 320px for the image itself.
const BLOG_CARD_IMAGE_WIDTHS = [240, 320] as const
const BLOG_CARD_IMAGE_SIZES = "(min-width: 448px) 320px, calc(100vw - 128px)"
const BLOG_CARD_IMAGE_DEFAULT_WIDTH = 320

/**
 * Drop candidates wider than the source and pin the largest to the source's own width, so Sharp never
 * upscales. Astro applies this clamp itself for imported images but not for remote ones, where it
 * treats the ceiling as infinite (`assets/services/service.js`). Today's 1731px-wide originals turn
 * the hero's [400…1920] into [400…1280, 1731]; the card's [240, 320] already fits and is untouched.
 */
const clampWidths = (widths: readonly number[], maxWidth: number): number[] => {
  if (widths.every((width) => width <= maxWidth)) return [...widths]
  return [...new Set([...widths.filter((width) => width <= maxWidth), maxWidth])]
}

const resolveImage = async (
  src: string,
  widths: readonly number[],
  sizes: string,
  defaultWidth: number
): Promise<BlogImageAttributes> => {
  // Only our own CDN is authorised in `image.remotePatterns`; anything else (or an empty string on a
  // half-written draft) has to pass straight through, since `getImage` would reject it.
  if (!isCdnAsset(src)) return { src, srcSet: undefined, sizes }

  // Probe the original's intrinsic size. Reading `rawOptions` alone avoids touching the lazy `src`
  // getter, which is what registers an image for emission — so this costs a cached HEAD-ish fetch and
  // does not leave an unused full-size variant in the output.
  const { rawOptions } = await getImage({ src, inferSize: true, format: IMAGE_FORMAT, quality: IMAGE_QUALITY })
  const { width: originalWidth, height: originalHeight } = rawOptions
  // `inferSize` fills both dimensions for an authorised remote source, so this is belt-and-braces:
  // without them there is no aspect ratio to resize against, and serving the original is correct.
  if (!originalWidth || !originalHeight) return { src, srcSet: undefined, sizes }

  // `getImage` requires both dimensions for a remote source, and giving them explicitly also makes the
  // plain `src` the small default candidate rather than a full-size render.
  const width = Math.min(defaultWidth, originalWidth)
  const image = await getImage({
    src,
    width,
    height: Math.round((width * originalHeight) / originalWidth),
    widths: clampWidths(widths, originalWidth),
    format: IMAGE_FORMAT,
    quality: IMAGE_QUALITY,
  })

  return { src: image.src, srcSet: image.srcSet.attribute || undefined, sizes }
}

/** Hero image for a blog post page — the LCP element, also used for its `<link rel="preload">`. */
export const blogImage = (src: string): Promise<BlogImageAttributes> =>
  resolveImage(src, BLOG_IMAGE_WIDTHS, BLOG_IMAGE_SIZES, BLOG_IMAGE_DEFAULT_WIDTH)

/** Banner image for a post card on the blog index and taxonomy pages. */
export const blogCardImage = (src: string): Promise<BlogImageAttributes> =>
  resolveImage(src, BLOG_CARD_IMAGE_WIDTHS, BLOG_CARD_IMAGE_SIZES, BLOG_CARD_IMAGE_DEFAULT_WIDTH)

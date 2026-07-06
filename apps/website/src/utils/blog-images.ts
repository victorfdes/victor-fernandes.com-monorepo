import { cdnImage, cdnImageSrcSet } from "./cdn"

// Blog post hero images render at roughly the full content column — `max-w-7xl`
// minus the `px-8` gutters ≈ 1216px — and go full-bleed on mobile.
// Defining the widths/sizes once keeps the rendered <img> and its <link rel="preload"> requesting
// the exact same bytes, so the preload is reused rather than triggering a second download.
export const BLOG_IMAGE_WIDTHS = [400, 640, 800, 1080, 1280, 1920] as const
export const BLOG_IMAGE_SIZES = "(min-width: 1280px) 1216px, calc(100vw - 64px)"
const BLOG_IMAGE_DEFAULT_WIDTH = 800

// Blog index cards are capped at `max-w-sm` (24rem / 384px), so they should not
// request the same full-width image candidates as an article hero. The cards use
// `shadow-hover-box` padding, leaving roughly 320px for the image itself.
const BLOG_CARD_IMAGE_WIDTHS = [240, 320] as const
const BLOG_CARD_IMAGE_SIZES = "(min-width: 448px) 320px, calc(100vw - 128px)"
const BLOG_CARD_IMAGE_DEFAULT_WIDTH = 320

// Resolved responsive-image attributes for a blog featured image. `srcSet` is undefined when the
// source is not a transformable CDN URL (e.g. an empty featuredImage on an unpublished draft).
export const blogImage = (src: string) => ({
  src: cdnImage(src, { width: BLOG_IMAGE_DEFAULT_WIDTH }),
  srcSet: cdnImageSrcSet(src, BLOG_IMAGE_WIDTHS),
  sizes: BLOG_IMAGE_SIZES,
})

export const blogCardImage = (src: string) => ({
  src: cdnImage(src, { width: BLOG_CARD_IMAGE_DEFAULT_WIDTH }),
  srcSet: cdnImageSrcSet(src, BLOG_CARD_IMAGE_WIDTHS),
  sizes: BLOG_CARD_IMAGE_SIZES,
})

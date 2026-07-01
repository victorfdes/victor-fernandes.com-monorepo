import { cdnImage, cdnImageSrcSet } from "./cdn"

// Blog featured images (the post-list card banner and the post hero) render at roughly the full
// content column — `max-w-7xl` minus the `px-8` gutters ≈ 1216px — and go full-bleed on mobile.
// Defining the widths/sizes once keeps the rendered <img> and its <link rel="preload"> requesting
// the exact same bytes, so the preload is reused rather than triggering a second download.
export const BLOG_IMAGE_WIDTHS = [400, 640, 800, 1080, 1280, 1920] as const
export const BLOG_IMAGE_SIZES = "(min-width: 1280px) 1216px, calc(100vw - 64px)"
const BLOG_IMAGE_DEFAULT_WIDTH = 800

// Resolved responsive-image attributes for a blog featured image. `srcSet` is undefined when the
// source is not a transformable CDN URL (e.g. an empty featuredImage on an unpublished draft).
export const blogImage = (src: string) => ({
  src: cdnImage(src, { width: BLOG_IMAGE_DEFAULT_WIDTH }),
  srcSet: cdnImageSrcSet(src, BLOG_IMAGE_WIDTHS),
  sizes: BLOG_IMAGE_SIZES,
})

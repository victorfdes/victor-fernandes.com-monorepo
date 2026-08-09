# Blog images

Blog featured images are resized once, at build time. The browser never requests an image
transformation; it downloads a static file that already exists in the build output.

## Authoring

1. Export the hero at **1920px wide or more**, in roughly **16:9** — the hero and the index card both
   render `aspect-video` with `object-cover`, so anything much taller is cropped. JPEG is fine; the
   build converts to WebP.
2. Name it after the post and upload it to the R2 bucket at `images/<name>.jpg`.
3. Point the post's front-matter at the absolute URL:

   ```yaml
   featuredImage: "https://r2.victor-fernandes.com/images/<name>.jpg"
   ```

4. Run `pnpm --filter website build`. The resized variants appear in `dist/_astro/`.

The original must stay on the bucket. It is fetched on every cold build, and it is also the URL used
directly for `og:image`, `twitter:image` and the `BlogPosting` JSON-LD, where social scrapers need a
stable absolute address that does not change when the site is rebuilt.

## Generated variants

[`src/utils/blog-images.ts`](../apps/website/src/utils/blog-images.ts) owns the candidate widths and
the `sizes` attributes, and is the only place that resolves an image:

| Helper          | Widths                          | Rendered at                                 |
| --------------- | ------------------------------- | ------------------------------------------- |
| `blogImage`     | 400, 640, 800, 1080, 1280, 1920 | post hero — the LCP element, also preloaded |
| `blogCardImage` | 240, 320                        | index and taxonomy cards                    |

Both emit WebP at quality 80. WebP rather than AVIF is deliberate: at q80 it matches AVIF's byte size
for these images but decodes far more cheaply on the main thread, and AVIF's decode cost on the
preloaded LCP image measurably inflated blog Total Blocking Time.

Candidates wider than the source are dropped and the largest is pinned to the source's own width, so
Sharp never upscales. A 1731px original therefore yields `[400, 640, 800, 1080, 1280, 1731]`. This is
why step 1 asks for ≥1920px: a narrower original silently loses its top candidate.

A source that is not on the configured CDN origin is passed through untouched, with no `srcset` —
only that origin is authorised in `image.remotePatterns`.

## How it is wired

- `astro.config.mjs` allow-lists the CDN hostname (derived from `PUBLIC_STATIC_HOST_URL`) under
  `image.remotePatterns`, without which `getImage` refuses the remote source.
- The hero is resolved in `src/pages/blog/[slug].astro` and passed to both the `<img>` and the
  `<link rel="preload">`, which must stay identical or the LCP image downloads twice.
- The card banner is resolved by [`blog-collection.ts`](../apps/website/src/utils/blog-collection.ts)
  and attached to each `BlogPost` as `cardImage`. Resizing is async and React components render
  synchronously, so components must never call the image helpers themselves.
- `sharp` is a direct dependency of `apps/website`. Astro's default image service resolves it from the
  project root, so it cannot be relied on as a transitive dependency of `astro`.
- Astro caches downloaded originals in `apps/website/node_modules/.astro/assets/` and revalidates them
  with `etag`/`last-modified`, so repeat local builds do not re-download or re-encode.

## Caching

`apps/website/public/_headers` serves everything under `/_astro/*` as
`public, max-age=31536000, immutable`. Those filenames are content-hashed, so the bytes behind a URL
can never change. Without it, Cloudflare Pages applies `max-age=1800, must-revalidate` and every
image, font and script pays a revalidation round trip every 30 minutes.

Replacing an image at the same bucket path changes the hash of every generated variant, so no cache
purge is needed — but the original's own URL is unchanged and the bucket's `cache-control` still
applies to it, which matters for the social-preview scrapers.

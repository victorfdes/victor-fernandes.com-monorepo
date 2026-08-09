# 0007 — Build-time blog image resizing

- Status: Accepted
- Date: 2026-08-09

## Context

Blog featured images were resized per request by Cloudflare Image Transformations: the site emitted
`/cdn-cgi/image/width=…,format=webp,quality=80/<path>` URLs against the R2 asset origin, six candidate
widths for the post hero and two for the index card.

The bytes were correct, but the latency was not. A transformed variant inherits the origin object's
`Cache-Control`, and the R2 objects serve `max-age=1800`; Cloudflare says so in its own response
header, `warning: cf-images 299 "cache-control is too restrictive"`. Every variant therefore fell out
of the edge cache twice an hour and had to be re-encoded on the next request. Measured against
production:

|                                         |             |
| --------------------------------------- | ----------- |
| Cold / revalidated transform            | ~320–330 ms |
| Warm transform (`cf-cache-status: HIT`) | ~50–75 ms   |

`vary: accept` on the transform responses split each variant into more than one cache entry, making a
cold hit likelier still. The affected image is the LCP element of every post page.

Every candidate width is known at build time. Nothing about these images requires a runtime decision.

## Decision

Resize at build time with `astro:assets`, which fetches each original from the CDN, hands it to Sharp
and emits content-hashed WebP variants into `_astro/`. Cloudflare Pages serves those same-origin, and
`public/_headers` marks `/_astro/*` as `immutable` for a year. No `/cdn-cgi/image/` URL is emitted.

Originals stay on R2 rather than moving into the repository. Committing them — with or without Git
LFS — was rejected: LFS's free tier is 1 GB of storage and 1 GB of bandwidth per month, and _every_
CI checkout pulls LFS objects, so with several gate jobs per pull request bandwidth becomes the
binding constraint long before storage does. Fetching ~90 KB per post per build over free R2 egress
is cheaper and keeps the repository free of binaries.

`sharp` becomes a direct dependency of `apps/website`. Astro's default image service resolves it from
the project root, so its presence as a transitive optional dependency of `astro` is not enough under
pnpm's strict linking.

## Consequences

- The hero and card images are plain static files. No transformation, no `vary: accept`, no 30-minute
  revalidation cliff, and one fewer origin on the LCP path — the post page no longer preconnects to
  the CDN at all.
- Marking `/_astro/*` immutable also fixes the same 30-minute cliff for the bundled JavaScript and the
  self-hosted fonts, which is a larger win than the images alone.
- Output is slightly smaller than Cloudflare's at every width (2–6% at q80).
- The build now depends on the asset origin being reachable, and fails loudly if it is not. This
  matches how malformed front-matter is already treated.
- Build time grows with the number of posts on a cold cache (~0.6 s for three posts locally). Astro
  caches originals and encoded variants in `node_modules/.astro/assets/`, which CI does not currently
  restore; if the post count makes that matter, cache that directory.
- Candidate widths must be clamped to the source width by hand, because Astro only applies its
  no-upscale clamp to imported images, not remote ones. Hero sources should be ≥1920px wide or they
  quietly lose the top candidate.
- Cloudflare Image Transformations are no longer used anywhere. Other CDN assets (avatars, the resume
  photo, the resume PDF) were already stored at their display size and are unaffected.

Refines the build-output detail of [ADR 0006](0006-static-output-on-cloudflare-pages.md).

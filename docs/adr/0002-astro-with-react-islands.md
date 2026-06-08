# 0002 — Astro with React islands

- Status: Accepted
- Date: 2026-06-04

## Context

The site is content-led (portfolio, résumé, MDX blog) with islands of interactivity (theme toggle,
off-canvas menu, table of contents). It must hit a 100/100 Lighthouse budget for accessibility,
best-practices and SEO, and ship minimal JavaScript.

## Decision

Build with **Astro 6**, rendering static HTML by default and hydrating only interactive components
as **React 19 islands**. Author content as MDX validated by Zod content collections. Deploy the
**static output** to **Cloudflare Pages** (see [ADR 0006](0006-static-output-on-cloudflare-pages.md)
for the hosting decision).

## Consequences

- Near-zero JS on static pages; interactivity is opt-in per component, protecting the perf budget.
- React is available where it earns its place, so the shared `@repo/ui` library stays reusable.
- Some lint/tooling nuance for `.astro` files (handled explicitly in the ESLint config), and
  server-only modules (e.g. `astro:content` loaders) must stay out of client bundles.

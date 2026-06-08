# website

The Astro 6 site for [victor-fernandes.com](https://victor-fernandes.com),
deployed to Cloudflare Pages. It renders static HTML with React only on the
interactive islands (header, off-canvas menu, theme toggle, contact card).

## Scripts

```bash
pnpm --filter website dev        # dev server on :4321
pnpm --filter website build      # static build → dist/
pnpm --filter website typecheck  # astro check
pnpm --filter website test       # Vitest unit tests
pnpm --filter website e2e        # Playwright (boots the dev server)
```

## Notable spots

- `src/layouts/` — `Layout.astro` (head, fonts, theme/GA bootstrap) and
  `AppLayout.tsx` (the single hydrated island providing theme context).
- `src/content.config.ts` + `src/utils/blog-collection.ts` — the typed,
  validated blog data layer.
- `src/pages/blog/**` — listing, post, and plural taxonomy routes
  (`/blog/categories/<slug>`, `/blog/tags/<slug>`).

UI primitives come from [`@repo/ui`](../../packages/ui); design tokens live in
its `theme.css`. Set `PUBLIC_GA_MEASUREMENT_ID` to enable analytics (off by
default).

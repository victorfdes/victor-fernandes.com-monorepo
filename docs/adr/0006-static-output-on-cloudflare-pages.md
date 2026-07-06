# 0006 — Static output on Cloudflare Pages

- Status: Accepted
- Date: 2026-06-08

## Context

The site is content-led and renders static HTML, hydrating only React islands (see
[ADR 0002](0002-astro-with-react-islands.md)). It was nonetheless built and shipped as a Cloudflare
**Worker** via the `@astrojs/cloudflare` adapter (`output: "server"`) and deployed with `wrangler`
from a bespoke GitHub Actions workflow. Nothing in the app used the server runtime — no on-demand
rendering, no middleware, no API routes (the RSS feed is a build-time endpoint), and no bindings. The
Worker therefore added operational surface (a `wrangler.jsonc`, a `wrangler` dependency and generated
types, Cloudflare API-token secrets, a separate `website-staging` Worker, and three deploy jobs)
without buying anything.

## Decision

Build Astro as **static output** (its default; the adapter is removed) and deploy with **native
Cloudflare Pages Git integration**. `main` is the production branch; `develop` and pull requests get
Cloudflare Pages preview deployments, with `develop` keeping a stable preview alias that replaces the
former staging Worker. The Wrangler-based deploy workflow is deleted; all quality gates in CI and the
git-flow branch model are unchanged.

Production branch auto-deploys are disabled in Cloudflare Pages. A GitHub Actions workflow runs the
production gates on `main` pushes and then calls a Cloudflare Pages deploy hook for `main`, so the
production build is queued only after CI, e2e, Lighthouse, and the SonarCloud quality gate pass.

## Consequences

- Less to operate: no `wrangler.jsonc`, no `wrangler`/adapter dependency, no Cloudflare API-token
  secrets in CI, and no hand-written asset upload. Cloudflare still builds the site; GitHub decides
  when to trigger the production build via deploy hook.
- Preview deployments are first-class and automatic for every branch and PR, posted back to the PR as
  a deployment status, so review happens against a real URL.
- Build output is plain static files in `apps/website/dist`; image optimization runs at build time
  via Astro's default Sharp service.
- If the site ever needs server-rendered routes, edge middleware, or runtime bindings, that means
  re-introducing an adapter (and revisiting this decision) — an intentional trade for today's
  simplicity. Supersedes the deployment detail of ADR 0002.

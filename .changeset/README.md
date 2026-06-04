# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets). It tracks
versioning and changelog intent for the publishable workspace packages (currently `@repo/ui`;
the `website` app is deploy-only and ignored in `config.json`).

## Adding a changeset

When a PR changes a versioned package, run:

```bash
pnpm changeset
```

Pick the affected packages and a semver bump (patch / minor / major), then commit the generated
markdown file alongside your code. On merge to `main`, the **Release** workflow opens (or updates)
a "Version Packages" PR that applies the bumps and writes `CHANGELOG.md` entries. Merging that PR
performs the version bump; publishing is intentionally disabled until the library ships externally.

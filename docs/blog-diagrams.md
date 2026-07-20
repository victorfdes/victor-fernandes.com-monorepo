# Blog diagrams

Blog diagrams are authored as Mermaid flowcharts and published as static SVG. The browser does not
download Mermaid or render diagrams at runtime.

## Authoring

1. Add a kebab-case `.mmd` file to `apps/website/src/diagrams`.
2. Start with an explicit `flowchart` direction and include a single-line `accTitle` and `accDescr`.
3. Assign semantic classes such as `accent`, `muted`, `info`, `success`, `danger`, `heading`, or
   `ghost`. The generator owns their light and dark colours.
4. Run `pnpm --filter website diagrams:build`.
5. Embed the generated manifest entry in MDX with `<Diagram id="the-file-name" />`.

Do not use `style`, `classDef`, `linkStyle`, literal hexadecimal colours, per-diagram themes, click
handlers, or hand-edit generated SVGs. These are rejected so diagrams keep one visual language and
remain safe static assets.

## Generated artifacts

Each source produces two files under `apps/website/public/i`:

- `<id>.svg` for light mode
- `<id>-dark.svg` for dark mode

The generated manifest supplies the MDX component with both paths, intrinsic dimensions, and the
accessible title and description. The component follows the site's `.dark` class, including a
stored preference that differs from the operating-system theme.

The images are lazy-loaded into the same grid cell and use opacity for theme selection. Keeping both
variants in layout ensures they load together when the diagram approaches the viewport, so the first
theme switch is immediate. A minimum readable width sits inside a horizontally scrollable,
keyboard-focusable container. No additional React island is introduced.

## Validation

`pnpm --filter website diagrams:check` renders every source into memory and validates it against the
committed manifest using source/config fingerprints and a platform-neutral topology signature. The
manifest also hashes each committed SVG, so hand edits are rejected without comparing macOS and
Linux renderer bytes. The check fails for stale, missing, or orphaned output; malformed
accessibility metadata; unsafe SVG content; unresolved arrow markers; or light/dark geometry drift.
The website's Playwright command runs this check before its browser tests.

Increment `DIAGRAM_RENDERER_CONTRACT_VERSION` whenever the renderer configuration, semantic palette,
optimizer, or generated-file contract changes, then rebuild and commit the refreshed manifest and
assets.

Playwright Chromium must be installed locally before building or checking diagrams:

```bash
pnpm --filter website exec playwright install chromium
```

Normal Astro and Cloudflare builds consume the committed SVGs and do not need a browser.

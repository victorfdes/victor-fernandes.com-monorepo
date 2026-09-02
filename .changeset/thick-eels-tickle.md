---
"@repo/ui": minor
---

Add `DepthCard`, a layered 3D card: an accent face under a white glass sheen with a
concentric disc stack, which tilts and parallaxes on hover or focus.

The whole card is themed from one free-form `color` prop — the gradient, title, body, CTA
and icon tones are mixed from it via `color-mix()` in `theme.css`, so any CSS colour
works. Action buttons are passed as an array of JSX elements: the card supplies the fixed
circular chrome and the caller's element keeps its own href or click handler.

This is a deliberate exception to the documented "minimal and typographic, not
glassmorphic" aesthetic, scoped to opt-in showcase use. `.shadow-hover-box` remains the
default card treatment for site chrome.

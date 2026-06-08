# @repo/eslint-config

Shared ESLint 9 flat configs for the workspace.

| Entry                       | Extends | Use for                       |
| --------------------------- | ------- | ----------------------------- |
| `@repo/eslint-config/base`  | —       | Plain TypeScript packages     |
| `@repo/eslint-config/react` | base    | React (`.ts`/`.tsx`) packages |
| `@repo/eslint-config/astro` | react   | The Astro website             |

Includes typescript-eslint, import ordering, React + Hooks + jsx-a11y, the Astro
plugin, and Turbo env hygiene.

```js
// eslint.config.js
import { reactConfig } from "@repo/eslint-config/react"
export default reactConfig
```

import astro from "eslint-plugin-astro"
import { reactConfig } from "./react.js"

/**
 * Astro app layer: the React rule set plus the Astro plugin's recommended and
 * accessibility configs for `.astro` components.
 */
export const astroConfig = [...reactConfig, ...astro.configs.recommended, ...astro.configs["jsx-a11y-recommended"]]

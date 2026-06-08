import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

/**
 * Blog collection. Backed by the glob loader (Astro content layer) and validated
 * with Zod, so a malformed front-matter block fails the build rather than
 * shipping broken metadata. Field set mirrors what the MDX files actually use.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featuredImage: z.url(),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }

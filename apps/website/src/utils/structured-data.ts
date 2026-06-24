import { BLOG_SITE_URL } from "./blog"
import { LINKS } from "./links"

// schema.org JSON-LD builders. Kept pure (no `astro:content`/Astro imports) so they can be
// unit-tested and reused by any `.astro` page; `Layout.astro` serialises the returned object
// into a <script type="application/ld+json"> in <head>.

const AUTHOR_NAME = "Victor Fernandes"
const JOB_TITLE = "Fullstack Software Engineer"
const SITE_DESCRIPTION =
  "Building Performant Frontends at Scale since 2012. Passionate about clean code, intuitive UX, and scalable architectures."
const SAME_AS = [LINKS.GITHUB, LINKS.LINKEDIN, LINKS.X]

const author = () => ({ "@type": "Person", name: AUTHOR_NAME, url: BLOG_SITE_URL })

type BlogPostingInput = {
  url: string
  title: string
  description: string
  image: string
  datePublished: string
  dateModified?: string
}

/** Article rich-result schema for a single blog post. */
export const buildBlogPostingSchema = ({
  url,
  title,
  description,
  image,
  datePublished,
  dateModified,
}: BlogPostingInput) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description,
  image,
  url,
  datePublished,
  dateModified: dateModified ?? datePublished,
  mainEntityOfPage: { "@type": "WebPage", "@id": url },
  author: author(),
  publisher: author(),
})

/** Person entity for the site owner — used on the home page. */
export const buildPersonSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: AUTHOR_NAME,
  url: BLOG_SITE_URL,
  jobTitle: JOB_TITLE,
  sameAs: SAME_AS,
})

/** WebSite entity for the canonical origin — used on the home page. */
export const buildWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: AUTHOR_NAME,
  description: SITE_DESCRIPTION,
  url: BLOG_SITE_URL,
})

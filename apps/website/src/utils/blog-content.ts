export type BlogHeading = {
  id: string
  text: string
  level: 2 | 3
}

export type BlogTaxonomyValue = {
  label: string
  slug: string
}

type BlogPostIdentity = {
  slug: string
  category: string
  categorySlug: string
  tags: string[]
  tagSlugs: string[]
}

type DraftablePost = {
  draft?: boolean
}

const WORDS_PER_MINUTE = 225
const COMBINING_MARK_START = 0x0300
const COMBINING_MARK_END = 0x036f

const decodeBasicEntities = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")

const isAsciiLetterOrNumber = (character: string) => {
  const code = character.charCodeAt(0)

  return (code >= 48 && code <= 57) || (code >= 97 && code <= 122)
}

const isWhitespace = (character: string | undefined) => character === " " || character === "\t"

const trimRepeatedCharacter = (value: string, character: string) => {
  let start = 0
  let end = value.length

  while (value[start] === character) {
    start += 1
  }

  while (end > start && value[end - 1] === character) {
    end -= 1
  }

  return value.slice(start, end)
}

export const slugifyBlogValue = (value: string) => {
  let slug = ""
  let previousWasSeparator = false

  for (const character of value.normalize("NFKD").toLowerCase()) {
    const code = character.charCodeAt(0)

    if (code >= COMBINING_MARK_START && code <= COMBINING_MARK_END) {
      continue
    }

    if (character === "'" || character === '"') {
      continue
    }

    if (isAsciiLetterOrNumber(character)) {
      slug += character
      previousWasSeparator = false
      continue
    }

    if (!previousWasSeparator) {
      slug += "-"
      previousWasSeparator = true
    }
  }

  slug = trimRepeatedCharacter(slug, "-")

  if (!slug) {
    throw new Error(`Cannot create a blog slug from "${value}".`)
  }

  return slug
}

const findCharacter = (value: string, character: string, start: number) => {
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === character) {
      return index
    }
  }

  return -1
}

const copyUntilCharacter = (value: string, character: string, start: number) => {
  const end = findCharacter(value, character, start)

  return {
    text: end === -1 ? value.slice(start) : value.slice(start, end),
    nextIndex: end === -1 ? value.length : end + 1,
    found: end !== -1,
  }
}

const stripMarkdownLink = (value: string, start: number) => {
  const labelStart = value[start] === "!" && value[start + 1] === "[" ? start + 2 : start + 1
  const label = copyUntilCharacter(value, "]", labelStart)

  if (!label.found || value[label.nextIndex] !== "(") {
    return null
  }

  const destination = copyUntilCharacter(value, ")", label.nextIndex + 1)

  if (!destination.found) {
    return null
  }

  return {
    text: label.text,
    nextIndex: destination.nextIndex,
  }
}

// A linear single-pass tokenizer: branch-heavy by nature, with full unit coverage.
// eslint-disable-next-line sonarjs/cognitive-complexity
const stripMarkdownSyntax = (value: string) => {
  const decoded = decodeBasicEntities(value)
  let stripped = ""

  for (let index = 0; index < decoded.length; index += 1) {
    const character = decoded[index]
    if (character === undefined) continue

    if (character === "`") {
      const inlineCode = copyUntilCharacter(decoded, "`", index + 1)
      stripped += inlineCode.text
      // eslint-disable-next-line sonarjs/updated-loop-counter
      index = inlineCode.nextIndex - 1
      continue
    }

    if (character === "!" && decoded[index + 1] === "[") {
      const image = stripMarkdownLink(decoded, index)

      if (image) {
        stripped += image.text
        // eslint-disable-next-line sonarjs/updated-loop-counter
        index = image.nextIndex - 1
        continue
      }
    }

    if (character === "[") {
      const link = stripMarkdownLink(decoded, index)

      if (link) {
        stripped += link.text
        // eslint-disable-next-line sonarjs/updated-loop-counter
        index = link.nextIndex - 1
        continue
      }
    }

    if (character === "<") {
      const closingTagIndex = findCharacter(decoded, ">", index + 1)

      if (closingTagIndex !== -1) {
        // eslint-disable-next-line sonarjs/updated-loop-counter
        index = closingTagIndex
        continue
      }
    }

    if (character === "*" || character === "_" || character === "~") {
      continue
    }

    stripped += character
  }

  return stripped.trim()
}

const createUniqueSlug = (text: string, usedIds: Map<string, number>) => {
  const baseId = slugifyBlogValue(text)
  const currentCount = usedIds.get(baseId) ?? 0

  usedIds.set(baseId, currentCount + 1)
  return currentCount === 0 ? baseId : `${baseId}-${currentCount}`
}

const splitLines = (value: string) => {
  const lines: string[] = []
  let lineStart = 0

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "\n") {
      continue
    }

    const lineEnd = value[index - 1] === "\r" ? index - 1 : index
    lines.push(value.slice(lineStart, lineEnd))
    lineStart = index + 1
  }

  lines.push(value.slice(lineStart))
  return lines
}

const getFenceMarker = (line: string) => {
  const trimmed = line.trimStart()

  if (trimmed.startsWith("```")) {
    return "```"
  }

  if (trimmed.startsWith("~~~")) {
    return "~~~"
  }

  return null
}

const trimMarkdownClosingHashes = (value: string) => {
  let end = value.length

  while (end > 0 && isWhitespace(value[end - 1])) {
    end -= 1
  }

  let hashStart = end

  while (hashStart > 0 && value[hashStart - 1] === "#") {
    hashStart -= 1
  }

  if (hashStart < end && isWhitespace(value[hashStart - 1])) {
    end = hashStart - 1

    while (end > 0 && isWhitespace(value[end - 1])) {
      end -= 1
    }
  }

  return value.slice(0, end)
}

const parseMarkdownHeading = (line: string): { level: 2 | 3; text: string } | null => {
  let level = 0

  while (line[level] === "#") {
    level += 1
  }

  if ((level !== 2 && level !== 3) || !isWhitespace(line[level])) {
    return null
  }

  return {
    level,
    text: trimMarkdownClosingHashes(line.slice(level).trim()),
  }
}

const stripLeadingFrontmatter = (content: string) => {
  const lines = splitLines(content)
  let firstContentLine = 0

  while (firstContentLine < lines.length && lines[firstContentLine]?.trim() === "") {
    firstContentLine += 1
  }

  if (lines[firstContentLine]?.trim() !== "---") {
    return content
  }

  for (let index = firstContentLine + 1; index < lines.length; index += 1) {
    if (lines[index]?.trim() === "---") {
      return lines.slice(index + 1).join("\n")
    }
  }

  return content
}

const stripFencedCodeBlocks = (content: string) => {
  const lines: string[] = []
  let activeFence: string | null = null

  for (const line of splitLines(content)) {
    const marker = getFenceMarker(line)

    if (marker && (!activeFence || marker === activeFence)) {
      activeFence = activeFence ? null : marker
      lines.push(" ")
      continue
    }

    if (!activeFence) {
      lines.push(line)
    }
  }

  return lines.join("\n")
}

export const extractBlogHeadings = (content: string): BlogHeading[] => {
  const headings: BlogHeading[] = []
  const usedIds = new Map<string, number>()
  let insideFence = false

  for (const line of splitLines(content)) {
    if (getFenceMarker(line)) {
      insideFence = !insideFence
      continue
    }

    if (insideFence) {
      continue
    }

    const heading = parseMarkdownHeading(line)
    const text = heading ? stripMarkdownSyntax(heading.text) : ""

    if (heading && text) {
      headings.push({ id: createUniqueSlug(text, usedIds), text, level: heading.level })
    }
  }

  return headings
}

type MarkdownNode = {
  type?: string
  value?: string
  children?: MarkdownNode[]
  depth?: number
  data?: {
    hProperties?: Record<string, unknown>
  }
}

const getMarkdownNodeText = (node: MarkdownNode): string => {
  if (node.value) {
    return node.value
  }

  return node.children?.map(getMarkdownNodeText).join("") ?? ""
}

export const addBlogHeadingIds = () => {
  return (tree: MarkdownNode) => {
    const usedIds = new Map<string, number>()

    const visit = (node: MarkdownNode) => {
      if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
        const text = stripMarkdownSyntax(getMarkdownNodeText(node))

        if (text) {
          node.data = {
            ...node.data,
            hProperties: {
              ...node.data?.hProperties,
              id: createUniqueSlug(text, usedIds),
            },
          }
        }
      }

      node.children?.forEach(visit)
    }

    visit(tree)
  }
}

export const estimateBlogReadingTime = (content: string) => {
  const words = stripMarkdownSyntax(stripFencedCodeBlocks(stripLeadingFrontmatter(content)))
    .split(/\s+/)
    .filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return `${minutes} min read`
}

export const createBlogTaxonomyValue = (label: string): BlogTaxonomyValue => ({
  label,
  slug: slugifyBlogValue(label),
})

const assertUniqueSlugs = (posts: BlogPostIdentity[]) => {
  const seen = new Set<string>()

  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`Duplicate blog post slug "${post.slug}".`)
    }

    seen.add(post.slug)
  }
}

const assertUniqueTaxonomyLabels = (
  posts: BlogPostIdentity[],
  kind: "category" | "tag",
  values: (post: BlogPostIdentity) => BlogTaxonomyValue[]
) => {
  const labelsBySlug = new Map<string, string>()

  for (const value of posts.flatMap(values)) {
    const storedLabel = labelsBySlug.get(value.slug)

    if (storedLabel && storedLabel !== value.label) {
      throw new Error(`Blog ${kind} labels "${storedLabel}" and "${value.label}" both normalize to "${value.slug}".`)
    }

    labelsBySlug.set(value.slug, value.label)
  }
}

export const validateBlogCollection = (posts: BlogPostIdentity[]) => {
  assertUniqueSlugs(posts)
  assertUniqueTaxonomyLabels(posts, "category", (post) => [{ label: post.category, slug: post.categorySlug }])
  assertUniqueTaxonomyLabels(posts, "tag", (post) =>
    post.tags.map((label, index) => ({ label, slug: post.tagSlugs[index] ?? slugifyBlogValue(label) }))
  )
}

export const filterPublishedBlogPosts = <T extends DraftablePost>(posts: T[]) => posts.filter((post) => !post.draft)

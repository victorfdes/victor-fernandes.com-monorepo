/*
 * Heading extraction for the blog: builds the table-of-contents model from raw
 * markdown and assigns matching stable ids to rendered headings (as a remark
 * plugin), so anchors and the ToC always agree.
 */
import { getFenceMarker, isWhitespace, slugifyBlogValue, splitLines, stripMarkdownSyntax } from "./markdown-text"

export type BlogHeading = {
  id: string
  text: string
  level: 2 | 3
}

const createUniqueSlug = (text: string, usedIds: Map<string, number>) => {
  const baseId = slugifyBlogValue(text)
  const currentCount = usedIds.get(baseId) ?? 0

  usedIds.set(baseId, currentCount + 1)
  return currentCount === 0 ? baseId : `${baseId}-${currentCount}`
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

export const extractBlogHeadings = (content: string): BlogHeading[] => {
  const headings: BlogHeading[] = []
  const usedIds = new Map<string, number>()
  // Track the opening fence marker (not a boolean): a ``` block whose body
  // contains a ~~~ line must stay open, matching stripFencedCodeBlocks and the
  // mdast renderer that assigns the ids — otherwise the ToC lists an in-code
  // "heading" with no anchor to jump to.
  let activeFence: string | null = null

  for (const line of splitLines(content)) {
    const marker = getFenceMarker(line)

    if (marker && (!activeFence || marker === activeFence)) {
      activeFence = activeFence ? null : marker
      continue
    }

    if (activeFence) {
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

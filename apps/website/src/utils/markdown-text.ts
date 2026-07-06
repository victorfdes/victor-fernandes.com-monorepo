/*
 * Low-level text and markdown primitives shared by the blog utilities: slug
 * generation, line splitting, and hand-written single-pass strippers for
 * markdown syntax, frontmatter, and fenced code blocks.
 */

const COMBINING_MARK_START = 0x0300
const COMBINING_MARK_END = 0x036f

// `&amp;` must be decoded last: decoding it first turns `&amp;lt;` into `&lt;`,
// which the later passes would then double-unescape to a literal `<`.
const decodeBasicEntities = (value: string) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")

const isAsciiLetterOrNumber = (character: string) => {
  const code = character.codePointAt(0) ?? 0

  return (code >= 48 && code <= 57) || (code >= 97 && code <= 122)
}

export const isWhitespace = (character: string | undefined) => character === " " || character === "\t"

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
    const code = character.codePointAt(0) ?? 0

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
export const stripMarkdownSyntax = (value: string) => {
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

export const splitLines = (value: string) => {
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

export const getFenceMarker = (line: string) => {
  const trimmed = line.trimStart()

  if (trimmed.startsWith("```")) {
    return "```"
  }

  if (trimmed.startsWith("~~~")) {
    return "~~~"
  }

  return null
}

export const stripLeadingFrontmatter = (content: string) => {
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

export const stripFencedCodeBlocks = (content: string) => {
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

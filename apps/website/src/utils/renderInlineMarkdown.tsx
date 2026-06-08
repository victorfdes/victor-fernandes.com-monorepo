import React from "react"

/**
 * Parses a simple inline-markdown string into React nodes.
 *
 * Supported syntax (nestable):
 *   ~text~   -> <strong>  (bold / emphasis highlight)
 *   *text*   -> <em>      (italic)
 *
 * The parser processes `~...~` first so `~*foo*~` renders as <strong><em>foo</em></strong>.
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  return parseTokens(text)
}

type Delimiter = { char: "~" | "*"; tag: "strong" | "em" }

const DELIMITERS: Delimiter[] = [
  { char: "~", tag: "strong" },
  { char: "*", tag: "em" },
]

function parseTokens(input: string, depth = 0): React.ReactNode {
  const delim = DELIMITERS[depth]
  if (!delim) return input

  const parts: React.ReactNode[] = []
  let cursor = 0
  let key = 0

  while (cursor < input.length) {
    const openIdx = input.indexOf(delim.char, cursor)
    if (openIdx === -1) break

    const closeIdx = input.indexOf(delim.char, openIdx + 1)
    if (closeIdx === -1) break

    if (openIdx > cursor) {
      parts.push(<React.Fragment key={key++}>{parseTokens(input.slice(cursor, openIdx), depth + 1)}</React.Fragment>)
    }

    const inner = input.slice(openIdx + 1, closeIdx)
    parts.push(React.createElement(delim.tag, { key: key++ }, parseTokens(inner, depth + 1)))

    cursor = closeIdx + 1
  }

  if (cursor < input.length) {
    parts.push(<React.Fragment key={key++}>{parseTokens(input.slice(cursor), depth + 1)}</React.Fragment>)
  }

  return parts.length === 0 ? input : parts
}

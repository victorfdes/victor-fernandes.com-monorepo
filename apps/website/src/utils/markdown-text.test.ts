import { stripMarkdownSyntax } from "utils/markdown-text"

describe("stripMarkdownSyntax entity decoding", () => {
  it("decodes the basic HTML entities", () => {
    expect(stripMarkdownSyntax("Tom &amp; Jerry say &quot;hi&quot;")).toBe('Tom & Jerry say "hi"')
  })

  it("does not double-unescape entity-encoded entities", () => {
    // `&amp;lt;` is the *text* `&lt;` — decoding `&amp;` first would collapse it
    // to a literal `<`, which the tag stripper then swallows (CodeQL js/double-escaping).
    expect(stripMarkdownSyntax("a &amp;lt;b&amp;gt; c")).toBe("a &lt;b&gt; c")
    expect(stripMarkdownSyntax("&amp;amp;")).toBe("&amp;")
  })

  it("still strips real markup after decoding", () => {
    expect(stripMarkdownSyntax("&lt;kbd&gt;Alt&lt;/kbd&gt; *wins*")).toBe("Alt wins")
  })
})

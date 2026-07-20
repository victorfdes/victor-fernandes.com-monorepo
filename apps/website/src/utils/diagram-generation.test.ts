import {
  assertThemeGeometryMatches,
  createDiagramManifest,
  diagramAssetPaths,
  diagramIdFromFilename,
  discoverDiagramSourceFilenames,
  findArtifactDrift,
  serializeDiagramManifest,
  svgStructuralSignature,
  validateDiagramSource,
  validateGeneratedSvg,
} from "./diagram-generation"

const validSource = `flowchart TB
  accTitle: A useful diagram
  accDescr: A description that explains the relationships in the diagram.
  Start --> Finish
`

const validSvg = (colour = "#fff", path = "M0 0L10 10") => `<svg viewBox="0 0 100 80">
  <title>Useful diagram</title>
  <desc>A useful description.</desc>
  <style>.node { fill: ${colour}; }</style>
  <defs><marker id="arrow"><path d="M0 0L4 2L0 4Z" /></marker></defs>
  <path d="${path}" fill="${colour}" marker-end="url(#arrow)" />
</svg>`

describe("diagram source validation", () => {
  it("discovers only canonical sources in deterministic order", () => {
    expect(discoverDiagramSourceFilenames(["zeta.mmd", "notes.md", "alpha.mmd", "alpha.mmd.bak"])).toEqual([
      "alpha.mmd",
      "zeta.mmd",
    ])
  })

  it("derives a stable kebab-case id and required accessibility metadata", () => {
    expect(diagramIdFromFilename("system-flow.mmd")).toBe("system-flow")
    expect(validateDiagramSource("system-flow.mmd", validSource)).toEqual({
      description: "A description that explains the relationships in the diagram.",
      id: "system-flow",
      title: "A useful diagram",
    })
  })

  it.each([
    ["wrong extension", "system-flow.svg", validSource, "must end in .mmd"],
    ["unsafe filename", "System Flow.mmd", validSource, "must be kebab-case"],
    [
      "missing direction",
      "system-flow.mmd",
      validSource.replace("flowchart TB", "flowchart"),
      "explicit flowchart direction",
    ],
    ["missing title", "system-flow.mmd", validSource.replace("accTitle:", "title:"), "accTitle is required"],
    [
      "missing description",
      "system-flow.mmd",
      validSource.replace("accDescr:", "description:"),
      "accDescr is required",
    ],
    ["literal colour", "system-flow.mmd", `${validSource}\n%% #fff`, "literal colours"],
    ["style directive", "system-flow.mmd", `${validSource}\nstyle Start fill:red`, "inline style directives"],
    ["class definition", "system-flow.mmd", `${validSource}\nclassDef danger fill:red`, "inline style directives"],
    ["click directive", "system-flow.mmd", `${validSource}\nclick Start callback`, "interactive click directives"],
    ["theme override", "system-flow.mmd", `${validSource}\ntheme: dark`, "theme overrides"],
  ])("rejects %s", (_case, filename, source, message) => {
    expect(() => validateDiagramSource(filename, source)).toThrow(message)
  })
})

describe("diagram manifest", () => {
  it("sorts entries and builds both stable public asset paths", () => {
    const manifest = createDiagramManifest([
      { description: "Second", height: 200, id: "zeta", title: "Zeta", width: 300 },
      { description: "First", height: 100, id: "alpha", title: "Alpha", width: 150 },
    ])

    expect(Object.keys(manifest)).toEqual(["alpha", "zeta"])
    expect(manifest.alpha).toMatchObject({
      darkSrc: "/i/alpha-dark.svg",
      lightSrc: "/i/alpha.svg",
    })
    expect(diagramAssetPaths("system-flow")).toEqual({
      darkSrc: "/i/system-flow-dark.svg",
      lightSrc: "/i/system-flow.svg",
    })
    expect(serializeDiagramManifest(manifest)).toBe(`${JSON.stringify(manifest, null, 2)}\n`)
  })
})

describe("generated SVG validation", () => {
  it("accepts an accessible SVG with positive dimensions and resolved markers", () => {
    expect(() => validateGeneratedSvg("valid.svg", validSvg())).not.toThrow()
  })

  it.each([
    ["script", validSvg().replace("</svg>", "<script>alert(1)</script></svg>"), "scripts are not allowed"],
    [
      "external resource",
      validSvg().replace("<path d=", '<image href="https://example.com/x.png"/><path d='),
      "external or executable",
    ],
    ["missing title", validSvg().replace(/<title>.*<\/title>/, ""), "title is missing"],
    ["missing description", validSvg().replace(/<desc>.*<\/desc>/, ""), "description is missing"],
    ["invalid viewBox", validSvg().replace('viewBox="0 0 100 80"', 'viewBox="0 0 nope 80"'), "viewBox is invalid"],
    ["empty viewBox", validSvg().replace('viewBox="0 0 100 80"', 'viewBox="0 0 0 80"'), "dimensions must be positive"],
    ["missing marker", validSvg().replace('id="arrow"', 'id="other"'), "does not resolve"],
  ])("rejects an SVG with %s", (_case, svg, message) => {
    expect(() => validateGeneratedSvg("invalid.svg", svg)).toThrow(message)
  })

  it("compares geometry independently from theme colours and styling", () => {
    const light = validSvg("#fff")
    const dark = validSvg("#111")
    expect(svgStructuralSignature(light)).toBe(svgStructuralSignature(dark))
    expect(() => assertThemeGeometryMatches("flow", light, dark)).not.toThrow()
    expect(() => assertThemeGeometryMatches("flow", light, light)).toThrow("must use different palettes")
    expect(() =>
      assertThemeGeometryMatches("flow", light, dark.replace('viewBox="0 0 100 80"', 'viewBox="0 0 120 80"'))
    ).toThrow("different geometry")
  })
})

describe("artifact drift", () => {
  it("reports missing, stale, and orphaned outputs deterministically", () => {
    const expected = new Map([
      ["alpha.svg", "alpha"],
      ["beta.svg", "beta"],
    ])
    const actual = new Map([
      ["alpha.svg", "old alpha"],
      ["orphan.svg", "orphan"],
    ])

    expect(findArtifactDrift(expected, actual)).toEqual(["missing beta.svg", "orphaned orphan.svg", "stale alpha.svg"])
  })
})

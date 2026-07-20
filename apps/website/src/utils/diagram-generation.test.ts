import {
  assertPathInsideDirectory,
  assertThemeGeometryMatches,
  createDiagramSourceHash,
  createDiagramManifest,
  diagramAssetFilePathsFromManifest,
  diagramAssetPaths,
  diagramIdFromFilename,
  discoverDiagramSourceFilenames,
  findArtifactDrift,
  hashDiagramContent,
  inspectGeneratedSvg,
  parseDiagramManifestIds,
  serializeDiagramManifest,
  svgStructuralSignature,
  svgTopologyHash,
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

const validArtifact = (id: string, title: string) => ({
  darkHash: `${id}-dark-hash`,
  description: `${title} description`,
  height: 100,
  id,
  lightHash: `${id}-light-hash`,
  sourceHash: `${id}-source-hash`,
  title,
  topologyHash: `${id}-topology-hash`,
  width: 150,
})

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

  it("allows semantic classes and semicolons inside quoted labels", () => {
    expect(() =>
      validateDiagramSource(
        "system-flow.mmd",
        validSource.replace("Start --> Finish", 'Start["Keep; going with :::prose"]:::accent --> Finish:::success')
      )
    ).not.toThrow()
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
    ["style directive", "system-flow.mmd", `${validSource}\nstyle Start fill:red`, "style directives"],
    ["class definition", "system-flow.mmd", `${validSource}\nclassDef danger fill:red`, "classdef directives"],
    ["class directive", "system-flow.mmd", `${validSource}\nclass Start danger`, "class directives"],
    ["click directive", "system-flow.mmd", `${validSource}\nclick Start callback`, "click directives"],
    ["theme override", "system-flow.mmd", `${validSource}\ntheme: dark`, "configuration is owned"],
    ["init directive", "system-flow.mmd", `${validSource}\n%%{init: { 'theme': 'dark' }}%%`, "init and config"],
    [
      "statement separator bypass",
      "system-flow.mmd",
      validSource.replace("Start --> Finish", "Start --> Finish; style Start fill:red"),
      "one Mermaid statement per line",
    ],
    [
      "unknown semantic class",
      "system-flow.mmd",
      validSource.replace("Start --> Finish", "Start:::unapproved --> Finish"),
      "unknown semantic class unapproved",
    ],
  ])("rejects %s", (_case, filename, source, message) => {
    expect(() => validateDiagramSource(filename, source)).toThrow(message)
  })
})

describe("diagram manifest", () => {
  it("sorts entries and builds both stable public asset paths", () => {
    const manifest = createDiagramManifest([
      { ...validArtifact("zeta", "Zeta"), height: 200, width: 300 },
      validArtifact("alpha", "Alpha"),
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

  it("validates manifest ids without trusting stored asset paths", () => {
    const manifest = JSON.stringify({
      alpha: { id: "alpha", lightSrc: "../../../package.json" },
      zeta: { id: "zeta" },
    })
    expect(parseDiagramManifestIds(manifest)).toEqual(["alpha", "zeta"])
    expect(() => parseDiagramManifestIds(JSON.stringify({ "../outside": { id: "../outside" } }))).toThrow(
      "must be kebab-case"
    )
    expect(() => parseDiagramManifestIds(JSON.stringify({ alpha: { id: "different" } }))).toThrow("same validated id")
  })

  it("allows generated asset targets only inside the asset directory", () => {
    expect(assertPathInsideDirectory("/workspace/public/i", "/workspace/public/i/alpha.svg")).toBe(
      "/workspace/public/i/alpha.svg"
    )
    expect(() => assertPathInsideDirectory("/workspace/public/i", "/workspace/package.json")).toThrow(
      "Refusing generated-asset operation"
    )
    expect(() => assertPathInsideDirectory("/workspace/public/i", "/workspace/public/i")).toThrow(
      "Refusing generated-asset operation"
    )
    const manifest = JSON.stringify({ alpha: { id: "alpha", lightSrc: "../../../package.json" } })
    expect(diagramAssetFilePathsFromManifest(manifest, "/workspace/public/i")).toEqual([
      "/workspace/public/i/alpha.svg",
      "/workspace/public/i/alpha-dark.svg",
    ])
  })

  it("fingerprints source and artifact content deterministically", () => {
    expect(createDiagramSourceHash(validSource)).toBe(createDiagramSourceHash(validSource))
    expect(createDiagramSourceHash(`${validSource}\n`)).not.toBe(createDiagramSourceHash(validSource))
    expect(createDiagramSourceHash(validSource, 3)).not.toBe(createDiagramSourceHash(validSource, 2))
    expect(hashDiagramContent("light")).not.toBe(hashDiagramContent("dark"))
    expect(hashDiagramContent("light")).toHaveLength(64)
  })
})

describe("generated SVG validation", () => {
  it("accepts an accessible SVG with positive dimensions and resolved markers", () => {
    expect(() => validateGeneratedSvg("valid.svg", validSvg())).not.toThrow()
    expect(inspectGeneratedSvg("valid.svg", validSvg())).toEqual({
      description: "A useful description.",
      height: 80,
      title: "Useful diagram",
      width: 100,
    })
  })

  it.each([
    ["script", validSvg().replace("</svg>", "<script>alert(1)</script></svg>"), "scripts are not allowed"],
    ["event handler", validSvg().replace("<path d=", '<path onclick="alert(1)" d='), "event handlers"],
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
    ["malformed XML", validSvg().replace("</style>", ""), "SVG XML is invalid"],
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

  it("uses parsed structure instead of removable markup text", () => {
    const light = validSvg("#fff").replace(".node { fill: #fff; }", "&lt;style&gt;ignored&lt;/style&gt;")
    const dark = validSvg("#111").replace(".node { fill: #111; }", "different theme CSS")
    expect(svgStructuralSignature(light)).toBe(svgStructuralSignature(dark))
  })

  it("keeps topology stable across geometry changes and detects relationship changes", () => {
    const topologySvg = validSvg().replace(
      '<path d="M0 0L10 10" fill="#fff" marker-end="url(#arrow)" />',
      '<g class="node default accent" id="node-a"><text>A</text></g><path id="edge-a-b" data-edge="true" class="flowchart-link" d="M0 0L10 10" fill="#fff" marker-end="url(#arrow)" />'
    )
    expect(svgTopologyHash(topologySvg)).toBe(svgTopologyHash(topologySvg.replace("M0 0L10 10", "M5 5L20 20")))
    expect(svgTopologyHash(topologySvg)).not.toBe(svgTopologyHash(topologySvg.replace("edge-a-b", "edge-a-c")))
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

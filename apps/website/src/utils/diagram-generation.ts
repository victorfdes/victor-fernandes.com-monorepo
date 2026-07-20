import { createHash } from "node:crypto"
import { isAbsolute, join, relative, resolve, sep } from "node:path"
import { JSDOM } from "jsdom"

const DIAGRAM_SOURCE_EXTENSION = ".mmd"
const DIAGRAM_RENDERER_CONTRACT_VERSION = 2

const FLOW_DIRECTIONS = new Set(["BT", "LR", "RL", "TB", "TD"])
const FORBIDDEN_DIRECTIVES = new Set(["class", "classdef", "click", "linkstyle", "style"])
const SEMANTIC_CLASSES = new Set(["accent", "danger", "ghost", "heading", "info", "muted", "success"])
const MARKER_ATTRIBUTES = ["marker-start", "marker-mid", "marker-end"] as const
const QUOTE_CHARACTERS = new Set(['"', "'", "`"])

type QuoteCharacter = '"' | "'" | "`"

interface QuoteScanState {
  escaped: boolean
  quote: QuoteCharacter | undefined
  visible: string
}

export interface DiagramSourceMetadata {
  description: string
  id: string
  title: string
}

export interface DiagramArtifactMetadata extends DiagramSourceMetadata {
  darkHash: string
  height: number
  lightHash: string
  sourceHash: string
  topologyHash: string
  width: number
}

interface DiagramManifestEntry extends DiagramArtifactMetadata {
  darkSrc: string
  lightSrc: string
}

type DiagramManifest = Record<string, DiagramManifestEntry>

interface SvgMetadata {
  description: string
  height: number
  title: string
  width: number
}

export const discoverDiagramSourceFilenames = (filenames: readonly string[]): string[] =>
  filenames
    .filter((filename) => filename.endsWith(DIAGRAM_SOURCE_EXTENSION))
    .sort((left, right) => left.localeCompare(right, "en"))

const metadataValue = (lines: readonly string[], name: string): string | undefined => {
  const prefix = `${name.toLowerCase()}:`
  const line = lines.find((candidate) => candidate.trimStart().toLowerCase().startsWith(prefix))
  const value = line?.trimStart().slice(prefix.length).trim()
  return value?.length ? value : undefined
}

const hasHexColour = (source: string): boolean =>
  source
    .split("#")
    .slice(1)
    .some((candidate) => {
      const value = /^[\da-f]+/i.exec(candidate.slice(0, 8))?.[0] ?? ""
      return [3, 4, 6, 8].includes(value.length)
    })

const scanQuotedCharacter = (state: QuoteScanState, character: string): QuoteScanState => {
  if (state.escaped) return { escaped: false, quote: state.quote, visible: state.quote ? " " : character }
  if (character === "\\") return { escaped: true, quote: state.quote, visible: state.quote ? " " : character }
  if (!QUOTE_CHARACTERS.has(character)) {
    return { escaped: false, quote: state.quote, visible: state.quote ? " " : character }
  }
  const characterQuote = character as QuoteCharacter
  if (!state.quote) return { escaped: false, quote: characterQuote, visible: " " }
  return { escaped: false, quote: state.quote === characterQuote ? undefined : state.quote, visible: " " }
}

const unquotedText = (line: string): string => {
  let state: QuoteScanState = { escaped: false, quote: undefined, visible: "" }
  let result = ""
  for (const character of line) {
    state = scanQuotedCharacter(state, character)
    result += state.visible
  }
  return result
}

const hasUnquotedSemicolon = (line: string): boolean => unquotedText(line).includes(";")

const parseSvg = (filename: string, svg: string): SVGSVGElement => {
  try {
    const document = new JSDOM(svg, { contentType: "image/svg+xml" }).window.document
    const root = document.documentElement
    if (root.localName !== "svg") throw new Error("root element is not svg")
    return root as unknown as SVGSVGElement
  } catch (error) {
    throw new Error(`${filename}: SVG XML is invalid: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const directChildText = (root: SVGSVGElement, name: "desc" | "title"): string | undefined => {
  const child = [...root.children].find((element) => element.localName === name)
  const value = child?.textContent.trim()
  return value?.length ? value : undefined
}

const normalizedText = (value: string | null): string => value?.replace(/\s+/g, " ").trim() ?? ""

const geometryRecord = (element: Element): unknown => {
  if (element.localName === "style") return undefined
  const attributes = [...element.attributes]
    .filter(({ localName }) => {
      const name = localName.toLowerCase()
      return name !== "class" && name !== "d" && name !== "style" && !/(?:color|fill|stroke)/.test(name)
    })
    .map(({ localName, value }) => [localName, value] as const)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
  const children = [...element.childNodes]
    .map((child) => {
      if (child.nodeType === 1) return geometryRecord(child as Element)
      if (child.nodeType === 3) return normalizedText(child.textContent)
      return undefined
    })
    .filter((child) => child !== undefined && child !== "")
  return { attributes, children, name: element.localName }
}

const semanticClasses = (element: Element): string[] =>
  [...element.classList]
    .filter((name) => SEMANTIC_CLASSES.has(name))
    .sort((left, right) => left.localeCompare(right, "en"))

const markerKind = (value: string | null): string | undefined => {
  if (!value) return undefined
  const markerId = /^url\(#([^)]+)\)$/.exec(value)?.[1]
  return markerId?.split("-").slice(-1)[0]
}

export const hashDiagramContent = (contents: string): string => createHash("sha256").update(contents).digest("hex")

export const createDiagramSourceHash = (
  source: string,
  rendererContractVersion = DIAGRAM_RENDERER_CONTRACT_VERSION
): string => hashDiagramContent(`${String(rendererContractVersion)}\0${source}`)

export const diagramIdFromFilename = (filename: string): string => {
  if (!filename.endsWith(DIAGRAM_SOURCE_EXTENSION)) {
    throw new Error(`Diagram source must end in ${DIAGRAM_SOURCE_EXTENSION}: ${filename}`)
  }

  const id = filename.slice(0, -DIAGRAM_SOURCE_EXTENSION.length)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Diagram filename must be kebab-case: ${filename}`)
  }

  return id
}

const validateDiagramLine = (filename: string, line: string): void => {
  const normalized = line.trimStart().toLowerCase()
  if (normalized.startsWith("%%{")) {
    throw new Error(`${filename}: Mermaid init and config directives are owned by the diagram engine`)
  }
  if (normalized.startsWith("%%")) return
  if (hasUnquotedSemicolon(line)) {
    throw new Error(`${filename}: use one Mermaid statement per line; unquoted semicolons are not allowed`)
  }
  const instruction = normalized.split(/\s+/, 1)[0]
  if (instruction && FORBIDDEN_DIRECTIVES.has(instruction)) {
    throw new Error(`${filename}: ${instruction} directives are owned by the diagram engine`)
  }
  if (
    normalized.startsWith("config:") ||
    normalized.startsWith("init:") ||
    normalized.startsWith("theme:") ||
    normalized.startsWith("themevariables:")
  ) {
    throw new Error(`${filename}: Mermaid configuration is owned by the diagram engine`)
  }
}

const validateSemanticClasses = (filename: string, source: string): void => {
  for (const line of source.split(/\r?\n/)) {
    for (const match of unquotedText(line).matchAll(/:::([a-z][\w-]*)/gi)) {
      const className = match[1]?.toLowerCase()
      if (!className || !SEMANTIC_CLASSES.has(className)) {
        throw new Error(`${filename}: unknown semantic class ${className ?? "<missing>"}`)
      }
    }
  }
}

export const validateDiagramSource = (filename: string, source: string): DiagramSourceMetadata => {
  const id = diagramIdFromFilename(filename)
  const lines = source.split(/\r?\n/)
  const declaration = lines
    .find((line) => line.trimStart().toLowerCase().startsWith("flowchart "))
    ?.trim()
    .split(/\s+/)
  const direction = declaration?.[1]?.toUpperCase()
  if (!direction || !FLOW_DIRECTIONS.has(direction)) {
    throw new Error(`${filename}: v1 diagrams must use an explicit flowchart direction`)
  }

  const title = metadataValue(lines, "accTitle")
  const description = metadataValue(lines, "accDescr")
  if (!title) throw new Error(`${filename}: accTitle is required`)
  if (!description) throw new Error(`${filename}: a single-line accDescr is required`)

  for (const line of lines) validateDiagramLine(filename, line)
  validateSemanticClasses(filename, source)
  if (hasHexColour(source)) throw new Error(`${filename}: literal colours are owned by the diagram engine`)

  return { description, id, title }
}

export const diagramAssetPaths = (id: string) => ({
  darkSrc: `/i/${id}-dark.svg`,
  lightSrc: `/i/${id}.svg`,
})

export const parseDiagramManifestIds = (contents: string): string[] => {
  const manifest: unknown = JSON.parse(contents)
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Diagram manifest must be an object")
  }

  return Object.entries(manifest as Record<string, unknown>)
    .map(([id, entry]) => {
      diagramIdFromFilename(`${id}${DIAGRAM_SOURCE_EXTENSION}`)
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`Diagram manifest entry ${id} must contain the same validated id`)
      }
      if (!("id" in entry) || entry.id !== id) {
        throw new Error(`Diagram manifest entry ${id} must contain the same validated id`)
      }
      return id
    })
    .sort((left, right) => left.localeCompare(right, "en"))
}

export const assertPathInsideDirectory = (directory: string, target: string): string => {
  const root = resolve(directory)
  const path = resolve(target)
  const pathFromRoot = relative(root, path)
  if (!pathFromRoot || pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
    throw new Error(`Refusing generated-asset operation outside ${root}: ${path}`)
  }
  return path
}

export const diagramAssetFilePathsFromManifest = (contents: string, assetDirectory: string): string[] =>
  parseDiagramManifestIds(contents).flatMap((id) =>
    [`${id}.svg`, `${id}-dark.svg`].map((filename) =>
      assertPathInsideDirectory(assetDirectory, join(assetDirectory, filename))
    )
  )

export const createDiagramManifest = (diagrams: readonly DiagramArtifactMetadata[]): DiagramManifest =>
  Object.fromEntries(
    [...diagrams]
      .sort((left, right) => left.id.localeCompare(right.id, "en"))
      .map(({ darkHash, description, height, id, lightHash, sourceHash, title, topologyHash, width }) => [
        id,
        {
          darkHash,
          description,
          height,
          id,
          lightHash,
          sourceHash,
          title,
          topologyHash,
          width,
          ...diagramAssetPaths(id),
        },
      ])
  )

export const serializeDiagramManifest = (manifest: DiagramManifest): string => `${JSON.stringify(manifest, null, 2)}\n`

const validateSafeSvgElement = (filename: string, element: Element): void => {
  if (element.localName === "script") throw new Error(`${filename}: scripts are not allowed in generated SVG`)
  for (const attribute of element.attributes) {
    const name = attribute.localName.toLowerCase()
    if (name.startsWith("on")) throw new Error(`${filename}: event handlers are not allowed in generated SVG`)
    if ((name === "href" || name === "src") && !attribute.value.startsWith("#")) {
      throw new Error(`${filename}: external or executable resources are not allowed`)
    }
  }
}

const validateMarkerReferences = (filename: string, root: SVGSVGElement): void => {
  const markerIds = new Set([...root.querySelectorAll("marker[id]")].map((marker) => marker.id))
  for (const element of root.querySelectorAll("*")) {
    for (const attribute of MARKER_ATTRIBUTES) {
      const reference = element.getAttribute(attribute)
      if (!reference) continue
      const markerId = /^url\(#([^)]+)\)$/.exec(reference)?.[1]
      if (!markerId || !markerIds.has(markerId)) {
        throw new Error(`${filename}: marker reference ${markerId ?? reference} does not resolve`)
      }
    }
  }
}

export const inspectGeneratedSvg = (filename: string, svg: string): SvgMetadata => {
  const root = parseSvg(filename, svg)
  for (const element of root.querySelectorAll("*")) validateSafeSvgElement(filename, element)

  const title = directChildText(root, "title")
  const description = directChildText(root, "desc")
  if (!title) throw new Error(`${filename}: SVG title is missing`)
  if (!description) throw new Error(`${filename}: SVG description is missing`)

  const viewBox = root.getAttribute("viewBox")?.trim().split(/\s+/).map(Number)
  if (viewBox?.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
    throw new Error(`${filename}: SVG viewBox is invalid`)
  }
  const width = viewBox[2]
  const height = viewBox[3]
  if (width === undefined || height === undefined || width <= 0 || height <= 0) {
    throw new Error(`${filename}: SVG viewBox dimensions must be positive`)
  }

  validateMarkerReferences(filename, root)

  return { description, height, title, width }
}

export const validateGeneratedSvg = (filename: string, svg: string): void => {
  inspectGeneratedSvg(filename, svg)
}

export const svgStructuralSignature = (svg: string): string =>
  JSON.stringify(geometryRecord(parseSvg("diagram.svg", svg)))

const svgTopologySignature = (svg: string): string => {
  const root = parseSvg("diagram.svg", svg)
  const nodes = [...root.querySelectorAll("g.node")].map((node) => ({
    classes: semanticClasses(node),
    id: node.id,
    text: normalizedText(node.textContent),
  }))
  const edges = [...root.querySelectorAll('path[data-edge="true"]')].map((edge) => ({
    classes: [...edge.classList].sort((left, right) => left.localeCompare(right, "en")),
    id: edge.id,
    markerEnd: markerKind(edge.getAttribute("marker-end")),
    markerStart: markerKind(edge.getAttribute("marker-start")),
  }))
  const clusters = [...root.querySelectorAll("g.cluster")].map((cluster) => ({
    classes: semanticClasses(cluster),
    id: cluster.id,
    text: normalizedText(cluster.textContent),
  }))
  return JSON.stringify({ clusters, edges, nodes })
}

export const svgTopologyHash = (svg: string): string => hashDiagramContent(svgTopologySignature(svg))

export const assertThemeGeometryMatches = (id: string, lightSvg: string, darkSvg: string): void => {
  const lightSignature = svgStructuralSignature(lightSvg)
  const darkSignature = svgStructuralSignature(darkSvg)
  if (lightSignature !== darkSignature) {
    throw new Error(`${id}: light and dark renders have different geometry`)
  }
  if (lightSvg === darkSvg) throw new Error(`${id}: light and dark renders must use different palettes`)
}

export const findArtifactDrift = (
  expected: ReadonlyMap<string, string>,
  actual: ReadonlyMap<string, string>
): string[] => {
  const drift: string[] = []
  for (const [path, contents] of expected) {
    if (!actual.has(path)) drift.push(`missing ${path}`)
    else if (actual.get(path) !== contents) drift.push(`stale ${path}`)
  }
  for (const path of actual.keys()) {
    if (!expected.has(path)) drift.push(`orphaned ${path}`)
  }
  return drift.sort((left, right) => left.localeCompare(right, "en"))
}

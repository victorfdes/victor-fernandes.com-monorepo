const DIAGRAM_SOURCE_EXTENSION = ".mmd"

const VIEW_BOX_PATTERN = /\bviewBox="([^"]+)"/
const MARKER_REFERENCE_PATTERN = /marker-(?:start|mid|end)="url\(#([^)]+)\)"/g
const MARKER_ID_PATTERN = /<marker\b[^>]*\bid="([^"]+)"/g
const FLOW_DIRECTIONS = new Set(["BT", "LR", "RL", "TB", "TD"])
const STYLE_DIRECTIVES = new Set(["classdef", "linkstyle", "style"])

export interface DiagramSourceMetadata {
  description: string
  id: string
  title: string
}

interface DiagramManifestEntry extends DiagramSourceMetadata {
  darkSrc: string
  height: number
  lightSrc: string
  width: number
}

type DiagramManifest = Record<string, DiagramManifestEntry>

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

const elementHasText = (svg: string, name: "desc" | "title"): boolean => {
  const open = svg.indexOf(`<${name}`)
  if (open < 0) return false
  const contentStart = svg.indexOf(">", open)
  if (contentStart < 0) return false
  const close = svg.indexOf(`</${name}>`, contentStart)
  return close > contentStart + 1 && svg.slice(contentStart + 1, close).trim().length > 0
}

const firstDifferenceIndex = (left: string, right: string): number => {
  const length = Math.min(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) return index
  }
  return left.length === right.length ? -1 : length
}

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

  for (const line of lines) {
    const normalized = line.trimStart().toLowerCase()
    const instruction = normalized.split(/\s+/, 1)[0]
    if (instruction && STYLE_DIRECTIVES.has(instruction)) {
      throw new Error(`${filename}: inline style directives are owned by the diagram engine`)
    }
    if (normalized.startsWith("click ")) {
      throw new Error(`${filename}: interactive click directives are owned by the diagram engine`)
    }
    if (normalized.startsWith("theme:") || normalized.startsWith("themevariables:")) {
      throw new Error(`${filename}: per-diagram theme overrides are owned by the diagram engine`)
    }
  }
  if (hasHexColour(source)) throw new Error(`${filename}: literal colours are owned by the diagram engine`)

  return { description, id, title }
}

export const diagramAssetPaths = (id: string) => ({
  darkSrc: `/i/${id}-dark.svg`,
  lightSrc: `/i/${id}.svg`,
})

export const createDiagramManifest = (
  diagrams: readonly (DiagramSourceMetadata & { height: number; width: number })[]
): DiagramManifest =>
  Object.fromEntries(
    [...diagrams]
      .sort((left, right) => left.id.localeCompare(right.id, "en"))
      .map((diagram) => [diagram.id, { ...diagram, ...diagramAssetPaths(diagram.id) }])
  )

export const serializeDiagramManifest = (manifest: DiagramManifest): string => `${JSON.stringify(manifest, null, 2)}\n`

export const validateGeneratedSvg = (filename: string, svg: string): void => {
  if (/<script\b/i.test(svg)) throw new Error(`${filename}: scripts are not allowed in generated SVG`)
  if (/\b(?:href|src)="(?:https?:|data:|javascript:)/i.test(svg)) {
    throw new Error(`${filename}: external or executable resources are not allowed`)
  }
  if (!elementHasText(svg, "title")) throw new Error(`${filename}: SVG title is missing`)
  if (!elementHasText(svg, "desc")) throw new Error(`${filename}: SVG description is missing`)

  const viewBox = VIEW_BOX_PATTERN.exec(svg)?.[1]?.trim().split(/\s+/).map(Number)
  if (viewBox?.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
    throw new Error(`${filename}: SVG viewBox is invalid`)
  }
  const width = viewBox[2]
  const height = viewBox[3]
  if (width === undefined || height === undefined || width <= 0 || height <= 0) {
    throw new Error(`${filename}: SVG viewBox dimensions must be positive`)
  }

  const markerIds = new Set([...svg.matchAll(MARKER_ID_PATTERN)].map((match) => match[1]))
  for (const match of svg.matchAll(MARKER_REFERENCE_PATTERN)) {
    const markerId = match[1]
    if (!markerId || !markerIds.has(markerId)) {
      throw new Error(`${filename}: marker reference ${markerId ?? "<missing>"} does not resolve`)
    }
  }
}

export const svgStructuralSignature = (svg: string): string =>
  svg
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/\s(?:class|style|[\w:-]*(?:color|fill|stroke)[\w:-]*)="[^"]*"/gi, "")
    // Mermaid approximates rounded node outlines with theme-sensitive path curves.
    // Node transforms, boxes and edge data-points remain in the signature; raw
    // path commands do not provide an additional stable geometry guarantee.
    .replace(/\sd="[^"]*"/gi, "")
    .replace(/\s+/g, " ")
    .trim()

export const assertThemeGeometryMatches = (id: string, lightSvg: string, darkSvg: string): void => {
  const lightSignature = svgStructuralSignature(lightSvg)
  const darkSignature = svgStructuralSignature(darkSvg)
  if (lightSignature !== darkSignature) {
    const differenceIndex = firstDifferenceIndex(lightSignature, darkSignature)
    const start = Math.max(0, differenceIndex - 80)
    throw new Error(
      `${id}: light and dark renders have different geometry near ${String(differenceIndex)}\n` +
        `light: ${lightSignature.slice(start, differenceIndex + 120)}\n` +
        `dark:  ${darkSignature.slice(start, differenceIndex + 120)}`
    )
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

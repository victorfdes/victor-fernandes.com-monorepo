import { readFile, readdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { createMermaidRenderer, type RenderResult } from "mermaid-isomorphic"
import { optimize } from "svgo"
import {
  assertThemeGeometryMatches,
  createDiagramManifest,
  discoverDiagramSourceFilenames,
  findArtifactDrift,
  serializeDiagramManifest,
  validateDiagramSource,
  validateGeneratedSvg,
  type DiagramSourceMetadata,
} from "../src/utils/diagram-generation.ts"

type Mode = "build" | "check"
type Theme = "dark" | "light"

const websiteRoot = fileURLToPath(new URL("..", import.meta.url))
const sourceDirectory = join(websiteRoot, "src/diagrams")
const assetDirectory = join(websiteRoot, "public/i")
const manifestPath = join(websiteRoot, "src/components/blog/_data/diagram-manifest.generated.json")

const palettes = {
  light: {
    background: "#ffffff",
    border: "#cbd5e1",
    canvas: "#ffffff",
    dangerBackground: "#fef2f2",
    dangerBorder: "#ef4444",
    dangerText: "#b91c1c",
    infoBackground: "#eff6ff",
    infoBorder: "#3b82f6",
    infoText: "#1d4ed8",
    line: "#94a3b8",
    mutedBackground: "#f1f5f9",
    mutedText: "#0f172a",
    primaryBackground: "#ecfeff",
    primaryBorder: "#06b6d4",
    primaryText: "#0e7490",
    secondaryText: "#475569",
    successBackground: "#ecfdf5",
    successBorder: "#10b981",
    successText: "#047857",
  },
  dark: {
    background: "#1e293b",
    border: "#52525b",
    canvas: "#1e293b",
    dangerBackground: "#450a0a",
    dangerBorder: "#f87171",
    dangerText: "#fecaca",
    infoBackground: "#172554",
    infoBorder: "#60a5fa",
    infoText: "#dbeafe",
    line: "#a1a1aa",
    mutedBackground: "#0f172a",
    mutedText: "#e4e4e7",
    primaryBackground: "#164e63",
    primaryBorder: "#22d3ee",
    primaryText: "#cffafe",
    secondaryText: "#d4d4d8",
    successBackground: "#052e16",
    successBorder: "#34d399",
    successText: "#d1fae5",
  },
} as const

const semanticThemeCss = (theme: Theme): string => {
  const palette = palettes[theme]
  const node = (name: string, background: string, border: string, text: string) => `
    .${name} > * { fill: ${background} !important; stroke: ${border} !important; stroke-width: 2px !important; color: ${text} !important; }
    .${name} span, .${name} p { color: ${text} !important; }
    .${name} text, .${name} tspan { fill: ${text} !important; }
  `

  return `
    ${node("accent", palette.primaryBackground, palette.primaryBorder, palette.primaryText)}
    ${node("muted", palette.mutedBackground, palette.border, palette.mutedText)}
    ${node("info", palette.infoBackground, palette.infoBorder, palette.infoText)}
    ${node("success", palette.successBackground, palette.successBorder, palette.successText)}
    ${node("danger", palette.dangerBackground, palette.dangerBorder, palette.dangerText)}
    .heading > *, .ghost > * { fill: transparent !important; stroke: transparent !important; color: ${palette.mutedText} !important; }
    .heading text, .heading tspan { fill: ${palette.mutedText} !important; font-size: 22px !important; font-weight: 600 !important; }
    .ghost text, .ghost tspan { fill: ${palette.secondaryText} !important; }
    .edgeLabel .background { fill: ${palette.canvas} !important; stroke: none !important; }
    .edgeLabel text, .edgeLabel tspan { fill: ${palette.secondaryText} !important; font-weight: 600 !important; }
    .cluster rect { fill: transparent !important; stroke: ${palette.border} !important; stroke-dasharray: 5 5 !important; }
    .cluster.lane rect { stroke: transparent !important; }
  `
}

const mermaidConfig = (theme: Theme, seed: string) => {
  const palette = palettes[theme]
  return {
    deterministicIds: true,
    deterministicIDSeed: seed,
    fontFamily: "Arial, sans-serif",
    handDrawnSeed: 1,
    flowchart: {
      curve: "linear" as const,
      diagramPadding: 16,
      htmlLabels: false,
      nodeSpacing: 42,
      rankSpacing: 48,
      wrappingWidth: 260,
    },
    look: "classic" as const,
    securityLevel: "strict" as const,
    startOnLoad: false,
    theme: "base" as const,
    themeCSS: semanticThemeCss(theme),
    themeVariables: {
      background: palette.background,
      clusterBkg: palette.canvas,
      clusterBorder: palette.border,
      edgeLabelBackground: palette.canvas,
      lineColor: palette.line,
      mainBkg: palette.mutedBackground,
      nodeBorder: palette.border,
      primaryBorderColor: palette.border,
      primaryColor: palette.mutedBackground,
      primaryTextColor: palette.mutedText,
      secondaryColor: palette.primaryBackground,
      secondaryTextColor: palette.primaryText,
      tertiaryColor: palette.canvas,
      tertiaryTextColor: palette.mutedText,
      textColor: palette.mutedText,
      titleColor: palette.mutedText,
    },
  }
}

const optimizeSvg = (svg: string): string => {
  const result = optimize(svg, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupIds: false,
            removeDesc: false,
          },
        },
      },
    ],
  })
  return `${result.data.trim()}\n`
}

const unwrapRender = (result: PromiseSettledResult<RenderResult>, id: string, theme: Theme): RenderResult => {
  if (result.status === "rejected") throw new Error(`${id} (${theme}): ${String(result.reason)}`)
  return result.value
}

const readSources = async () => {
  const filenames = discoverDiagramSourceFilenames(await readdir(sourceDirectory))

  return Promise.all(
    filenames.map(async (filename) => {
      const source = await readFile(join(sourceDirectory, filename), "utf8")
      return { filename, metadata: validateDiagramSource(filename, source), source }
    })
  )
}

const renderTheme = async (
  renderer: ReturnType<typeof createMermaidRenderer>,
  sources: readonly { metadata: DiagramSourceMetadata; source: string }[],
  theme: Theme
) => {
  const rendered = await Promise.all(
    sources.map(async ({ metadata, source }) => {
      const [result] = await renderer([source], {
        mermaidConfig: mermaidConfig(theme, metadata.id),
        prefix: `diagram-${metadata.id}`,
      })
      if (!result) throw new Error(`${metadata.id} (${theme}): renderer returned no result`)
      return unwrapRender(result, metadata.id, theme)
    })
  )
  return rendered
}

const collectArtifacts = async (): Promise<Map<string, string>> => {
  const sources = await readSources()
  if (sources.length === 0) throw new Error("No Mermaid diagram sources found")

  const renderer = createMermaidRenderer()
  const [lightResults, darkResults] = await Promise.all([
    renderTheme(renderer, sources, "light"),
    renderTheme(renderer, sources, "dark"),
  ])

  const manifestItems: (DiagramSourceMetadata & { height: number; width: number })[] = []
  const artifacts = new Map<string, string>()
  for (const [index, source] of sources.entries()) {
    const light = lightResults[index]
    const dark = darkResults[index]
    if (!light || !dark) throw new Error(`${source.metadata.id}: incomplete render results`)
    if (light.width !== dark.width || light.height !== dark.height) {
      throw new Error(`${source.metadata.id}: light and dark dimensions differ`)
    }

    assertThemeGeometryMatches(source.metadata.id, light.svg, dark.svg)
    const lightSvg = optimizeSvg(light.svg)
    const darkSvg = optimizeSvg(dark.svg)
    const lightFilename = `${source.metadata.id}.svg`
    const darkFilename = `${source.metadata.id}-dark.svg`
    validateGeneratedSvg(lightFilename, lightSvg)
    validateGeneratedSvg(darkFilename, darkSvg)
    artifacts.set(join(assetDirectory, lightFilename), lightSvg)
    artifacts.set(join(assetDirectory, darkFilename), darkSvg)
    manifestItems.push({ ...source.metadata, height: light.height, width: light.width })
  }
  artifacts.set(manifestPath, serializeDiagramManifest(createDiagramManifest(manifestItems)))
  return artifacts
}

const readOptionalFile = async (path: string): Promise<string | undefined> => {
  try {
    return await readFile(path, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    return undefined
  }
}

const previousArtifactPaths = async (): Promise<string[]> => {
  const contents = await readOptionalFile(manifestPath)
  if (!contents) return []

  const previousManifest = JSON.parse(contents) as Record<string, { darkSrc: string; lightSrc: string }>
  return Object.values(previousManifest).flatMap(({ darkSrc, lightSrc }) =>
    [lightSrc, darkSrc].map((src) => join(websiteRoot, "public", src.replace(/^\//, "")))
  )
}

const readTrackedArtifacts = async (expected: ReadonlyMap<string, string>): Promise<Map<string, string>> => {
  const paths = new Set([...expected.keys(), ...(await previousArtifactPaths())])
  const files = await Promise.all([...paths].map(async (path) => ({ contents: await readOptionalFile(path), path })))
  const actual = new Map<string, string>()
  for (const { contents, path } of files) {
    if (contents !== undefined) actual.set(path, contents)
  }
  return actual
}

const writeArtifacts = async (expected: ReadonlyMap<string, string>, actual: ReadonlyMap<string, string>) => {
  for (const path of actual.keys()) {
    if (!expected.has(path) && path !== manifestPath) await rm(path)
  }
  for (const [path, contents] of expected) await writeFile(path, contents)
}

const main = async () => {
  const mode = process.argv[2] as Mode | undefined
  if (mode !== "build" && mode !== "check") throw new Error("Usage: diagrams.ts <build|check>")

  const expected = await collectArtifacts()
  const actual = await readTrackedArtifacts(expected)
  const drift = findArtifactDrift(expected, actual)

  if (mode === "check") {
    if (drift.length > 0) {
      const formattedDrift = drift.map((item) => `- ${item}`).join("\n")
      throw new Error(`Generated diagrams are out of date:\n${formattedDrift}`)
    }
    console.log(`Verified ${String((expected.size - 1) / 2)} diagrams in both themes.`)
    return
  }

  await writeArtifacts(expected, actual)
  console.log(`Generated ${String((expected.size - 1) / 2)} diagrams in both themes.`)
}

await main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

import { readFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

// Token-free SonarCloud reader. This project is public, so the SonarCloud Web API
// answers issue / measure / quality-gate queries anonymously — no token and no
// Docker required. Optional env overrides:
//   SONAR_HOST_URL   target a self-hosted SonarQube (default https://sonarcloud.io)
//   SONAR_TOKEN      authenticate (needed only for private projects)
//
// Usage (from the repo root):
//   node scripts/sonar-issues.mjs          human-readable report
//   node scripts/sonar-issues.mjs --json   raw JSON for tooling / agents
//
// Exits non-zero when the quality gate is failing.

const HOST = (process.env.SONAR_HOST_URL ?? "https://sonarcloud.io").replace(/\/+$/, "")
const TOKEN = process.env.SONAR_TOKEN
const asJson = process.argv.includes("--json")

const HEADLINE_METRICS = [
  "alert_status",
  "bugs",
  "vulnerabilities",
  "security_hotspots",
  "code_smells",
  "coverage",
  "duplicated_lines_density",
]

const readSonarConfig = async () => {
  const file = path.join(process.cwd(), "sonar-project.properties")
  const raw = await readFile(file, "utf8")
  const props = new Map()

  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }
    const separator = trimmed.indexOf("=")
    if (separator === -1) {
      continue
    }
    props.set(trimmed.slice(0, separator).trim(), trimmed.slice(separator + 1).trim())
  }

  const projectKey = props.get("sonar.projectKey")
  if (!projectKey) {
    throw new Error(`sonar.projectKey not found in ${file}`)
  }

  return { projectKey, organization: props.get("sonar.organization") }
}

const api = async (endpoint, params) => {
  const url = new URL(`${HOST}/${endpoint}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
  })
  if (!response.ok) {
    throw new Error(`${endpoint} -> HTTP ${response.status} ${response.statusText}`)
  }

  return response.json()
}

const fetchAllIssues = async (projectKey) => {
  const pageSize = 500
  const issues = []

  for (let page = 1; ; page += 1) {
    const data = await api("api/issues/search", {
      componentKeys: projectKey,
      resolved: "false",
      ps: String(pageSize),
      p: String(page),
    })

    issues.push(...data.issues)
    const total = data.paging?.total ?? issues.length
    if (data.issues.length === 0 || issues.length >= total) {
      break
    }
  }

  return issues
}

const collect = async () => {
  const { projectKey } = await readSonarConfig()

  const [gate, measures, hotspots, issues] = await Promise.all([
    api("api/qualitygates/project_status", { projectKey }),
    api("api/measures/component", { component: projectKey, metricKeys: HEADLINE_METRICS.join(",") }),
    api("api/hotspots/search", { projectKey, status: "TO_REVIEW", ps: "500" }),
    fetchAllIssues(projectKey),
  ])

  return { projectKey, gate, measures, hotspots, issues }
}

const measureMap = (measures) => {
  const map = new Map()
  for (const measure of measures.component?.measures ?? []) {
    map.set(measure.metric, measure.value)
  }
  return map
}

const printReport = ({ projectKey, gate, measures, hotspots, issues }) => {
  const gateStatus = gate.projectStatus?.status ?? "UNKNOWN"
  const metrics = measureMap(measures)
  const fmt = (key) => metrics.get(key) ?? "?"

  console.log(`Project:      ${projectKey}`)
  console.log(`Quality gate: ${gateStatus}`)
  console.log(
    `Metrics:      bugs=${fmt("bugs")} vulnerabilities=${fmt("vulnerabilities")} ` +
      `hotspots=${fmt("security_hotspots")} code_smells=${fmt("code_smells")} ` +
      `coverage=${fmt("coverage")}% duplication=${fmt("duplicated_lines_density")}%`
  )

  const failing = (gate.projectStatus?.conditions ?? []).filter((c) => c.status !== "OK")
  if (failing.length > 0) {
    console.log(`\nFailing gate conditions (${failing.length}):`)
    for (const c of failing) {
      console.log(`  - ${c.metricKey}: ${c.actualValue} (${c.comparator} ${c.errorThreshold})`)
    }
  }

  const reviewable = hotspots.hotspots ?? []
  if (reviewable.length > 0) {
    console.log(`\nSecurity hotspots to review (${reviewable.length}):`)
    for (const h of reviewable) {
      const where = `${(h.component ?? "").split(":").pop()}:${h.line ?? "?"}`
      console.log(`  - ${h.securityCategory} ${where} — ${h.message}`)
    }
  }

  console.log(`\nOpen issues (${issues.length}):`)
  if (issues.length === 0) {
    console.log("  none 🎉")
    return
  }

  const byRule = new Map()
  for (const issue of issues) {
    const list = byRule.get(issue.rule) ?? []
    list.push(issue)
    byRule.set(issue.rule, list)
  }

  for (const [rule, list] of [...byRule.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${rule} (${list.length})`)
    for (const issue of list) {
      const where = `${(issue.component ?? "").split(":").pop()}:${issue.line ?? "?"}`
      // `severity` is absent under the newer Clean Code taxonomy, which carries it
      // per-impact instead — fall back so the report never crashes.
      const severity = issue.severity ?? issue.impacts?.[0]?.severity ?? "UNKNOWN"
      console.log(`    ${severity.padEnd(8)} ${where} — ${issue.message}`)
    }
  }
}

const main = async () => {
  const result = await collect()

  if (asJson) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    printReport(result)
  }

  if ((result.gate.projectStatus?.status ?? "OK") !== "OK") {
    process.exitCode = 1
  }
}

await main().catch((error) => {
  console.error(`sonar-issues: ${error.message}`)
  process.exitCode = 2
})

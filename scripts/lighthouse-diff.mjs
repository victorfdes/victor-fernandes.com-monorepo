#!/usr/bin/env node
// Compares a PR's Lighthouse run against the `develop` baseline and emits a
// Markdown delta table (to stdout and ./lighthouse-diff.md). Exits non-zero when
// a metric regresses beyond budget so CI can block the PR.
//
// Usage: node scripts/lighthouse-diff.mjs <baselineDir> <currentDir>
// Each dir is an LHCI filesystem-upload output containing manifest.json + lhr-*.json.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const [baselineDir, currentDir] = process.argv.slice(2)

if (!currentDir) {
  console.error("Usage: lighthouse-diff.mjs <baselineDir> <currentDir>")
  process.exit(2)
}

// Regression budgets: a PR fails if it crosses any of these against the baseline.
const BUDGETS = {
  Performance: { delta: -2, unit: "score" }, // perf score may not drop > 2 points
  LCP: { delta: 400, unit: "ms" }, // largest-contentful-paint may not grow > 400ms (CI LCP is noisy)
  TBT: { delta: 50, unit: "ms" },
  CLS: { delta: 0.02, unit: "" },
  "Total bytes": { delta: 20 * 1024, unit: "bytes" }, // < 20KB transfer growth
}

const METRICS = [
  { label: "Performance", kind: "score", category: "performance" },
  { label: "LCP", kind: "audit", audit: "largest-contentful-paint", unit: "ms" },
  { label: "TBT", kind: "audit", audit: "total-blocking-time", unit: "ms" },
  { label: "CLS", kind: "audit", audit: "cumulative-layout-shift", unit: "" },
  { label: "FCP", kind: "audit", audit: "first-contentful-paint", unit: "ms" },
  { label: "Speed Index", kind: "audit", audit: "speed-index", unit: "ms" },
  { label: "Total bytes", kind: "audit", audit: "total-byte-weight", unit: "bytes" },
]

const readManifest = (dir) => {
  const file = join(dir, "manifest.json")
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, "utf8"))
}

const pathOf = (url) => {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

// Index representative (median) runs by URL pathname.
const indexRuns = (manifest, dir) => {
  const byPath = new Map()
  for (const entry of manifest ?? []) {
    if (!entry.isRepresentativeRun) continue
    const lhr = JSON.parse(readFileSync(join(dir, entry.jsonPath.split("/").pop()), "utf8"))
    byPath.set(pathOf(entry.url), { summary: entry.summary, lhr })
  }
  return byPath
}

const valueFor = (metric, run) => {
  if (metric.kind === "score") return Math.round((run.summary[metric.category] ?? 0) * 100)
  return run.lhr.audits[metric.audit]?.numericValue ?? 0
}

const fmt = (metric, v) => {
  if (metric.kind === "score") return `${v}`
  if (metric.unit === "ms") return `${Math.round(v)}ms`
  if (metric.unit === "bytes") return `${(v / 1024).toFixed(1)}KB`
  return v.toFixed(3)
}

const sign = (n) => (n > 0 ? "▲" : n < 0 ? "▼" : "—")

const baseline = readManifest(baselineDir)
const current = readManifest(currentDir)

if (!current) {
  console.error(`No current Lighthouse manifest in ${currentDir}.`)
  process.exit(2)
}

let md = "## 🔦 Lighthouse vs `develop`\n\n"
let regressed = false

if (!baseline) {
  md += "_No `develop` baseline found yet — establishing one. Absolute scores still gated at 100/100._\n"
  writeFileSync("lighthouse-diff.md", md)
  console.log(md)
  process.exit(0)
}

const baseRuns = indexRuns(baseline, baselineDir)
const currRuns = indexRuns(current, currentDir)

for (const [path, curr] of currRuns) {
  const base = baseRuns.get(path)
  md += `<details open><summary><code>${path}</code></summary>\n\n`
  md += "| Metric | develop | PR | Δ |\n| --- | ---: | ---: | ---: |\n"
  for (const metric of METRICS) {
    const c = valueFor(metric, curr)
    if (!base) {
      md += `| ${metric.label} | — | ${fmt(metric, c)} | (new) |\n`
      continue
    }
    const b = valueFor(metric, base)
    const delta = c - b
    const budget = BUDGETS[metric.label]
    if (budget) {
      const crossed = budget.delta < 0 ? delta < budget.delta : delta > budget.delta
      if (crossed) regressed = true
    }
    const deltaStr =
      metric.kind === "score" ? `${sign(delta)} ${Math.abs(delta)}` : `${sign(delta)} ${fmt(metric, Math.abs(delta))}`
    md += `| ${metric.label} | ${fmt(metric, b)} | ${fmt(metric, c)} | ${deltaStr} |\n`
  }
  md += "\n</details>\n\n"
}

md += regressed
  ? "> ❌ **A metric regressed beyond budget.** Review the deltas above.\n"
  : "> ✅ No metric regressed beyond budget.\n"

writeFileSync("lighthouse-diff.md", md)
console.log(md)

process.exit(regressed ? 1 : 0)

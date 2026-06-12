import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()

const jobs = [
  {
    input: "apps/website/coverage/lcov.info",
    output: ".sonar/coverage/website.lcov",
    prefix: "apps/website",
  },
  {
    input: "packages/ui/coverage/lcov.info",
    output: ".sonar/coverage/ui.lcov",
    prefix: "packages/ui",
  },
]

const normalizePath = (filePath, prefix) => {
  // LCOV with relative package paths (e.g. src/foo.ts) cannot be resolved by Sonar
  // when scanning from monorepo root, so prefix package location.
  if (path.isAbsolute(filePath)) {
    return filePath
  }

  return path.posix.join(prefix, filePath.replaceAll("\\", "/"))
}

for (const job of jobs) {
  const source = await readFile(path.join(projectRoot, job.input), "utf8")

  const normalized = source
    .split("\n")
    .map((line) => {
      if (!line.startsWith("SF:")) {
        return line
      }

      return `SF:${normalizePath(line.slice(3), job.prefix)}`
    })
    .join("\n")

  const targetPath = path.join(projectRoot, job.output)
  await mkdir(path.dirname(targetPath), { recursive: true })
  await writeFile(targetPath, normalized, "utf8")

  console.log(`Wrote ${job.output}`)
}

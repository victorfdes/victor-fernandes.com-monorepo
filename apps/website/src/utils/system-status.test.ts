import {
  DEFAULT_SCORECARD_SCORE,
  DEFAULT_SONAR_METRICS,
  fetchScorecard,
  fetchSonarMetrics,
  fetchSystemStatus,
  formatCoverage,
  formatTechnicalDebt,
  mapRating,
  ratingTone,
} from "utils/system-status"

// Resolve `fetch` to a Response-like stub so the token-free public API calls can be
// unit-tested. `vi.stubGlobal` is untyped, so no cast is needed on the stub itself.
const stubFetch = (payload: unknown, { ok = true, status = 200 }: { ok?: boolean; status?: number } = {}) => {
  const fetchMock = vi.fn().mockResolvedValue({ ok, status, json: () => Promise.resolve(payload) })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("mapRating", () => {
  it("maps Sonar's float ratings to the A–E letters it shows", () => {
    expect(mapRating("1.0")).toBe("A")
    expect(mapRating("2")).toBe("B")
    expect(mapRating("3.4")).toBe("C")
    expect(mapRating("5")).toBe("E")
  })

  it("falls back to A for missing or out-of-range values so the chip never renders blank", () => {
    expect(mapRating(undefined)).toBe("A")
    expect(mapRating("0")).toBe("A")
    expect(mapRating("6")).toBe("A")
    expect(mapRating("not-a-number")).toBe("A")
  })
})

describe("formatTechnicalDebt", () => {
  it("renders minutes against an 8-hour day", () => {
    expect(formatTechnicalDebt(90)).toBe("1h 30min")
    expect(formatTechnicalDebt(150)).toBe("2h 30min")
    expect(formatTechnicalDebt(480)).toBe("1d")
  })

  it("keeps '0d' for zero, negative, or non-finite debt", () => {
    expect(formatTechnicalDebt(0)).toBe("0d")
    expect(formatTechnicalDebt(-5)).toBe("0d")
    expect(formatTechnicalDebt(Number.NaN)).toBe("0d")
  })
})

describe("formatCoverage", () => {
  it("trims to one decimal and drops a trailing .0", () => {
    expect(formatCoverage("95")).toBe("95%")
    expect(formatCoverage("95.24")).toBe("95.2%")
  })

  it("returns an em dash for non-numeric input", () => {
    expect(formatCoverage(undefined)).toBe("—")
    expect(formatCoverage("n/a")).toBe("—")
  })
})

describe("ratingTone", () => {
  it("greens A/B, ambers C, reds anything worse", () => {
    expect(ratingTone("A")).toContain("emerald")
    expect(ratingTone("B")).toContain("emerald")
    expect(ratingTone("C")).toContain("amber")
    expect(ratingTone("D")).toContain("red")
    expect(ratingTone("E")).toContain("red")
  })
})

describe("fetchSonarMetrics", () => {
  it("maps the measures payload into the footer's shape", async () => {
    const fetchMock = stubFetch({
      component: {
        measures: [
          { metric: "security_rating", value: "1.0" },
          { metric: "reliability_rating", value: "2.0" },
          { metric: "sqale_index", value: "90" },
          { metric: "coverage", value: "95.2" },
        ],
      },
    })

    await expect(fetchSonarMetrics()).resolves.toEqual({
      security: "A",
      reliability: "B",
      technicalDebt: "1h 30min",
      coverage: "95.2%",
    })

    const requestedUrl = String(fetchMock.mock.calls[0]?.[0])
    expect(requestedUrl).toContain("sonarcloud.io/api/measures/component")
    expect(requestedUrl).toContain("metricKeys=")
  })

  it("falls back to safe defaults when measures are missing", async () => {
    stubFetch({})

    await expect(fetchSonarMetrics()).resolves.toEqual({
      security: "A",
      reliability: "A",
      technicalDebt: "0d",
      coverage: "—",
    })
  })

  it("throws on a non-OK response", async () => {
    stubFetch({}, { ok: false, status: 500 })

    await expect(fetchSonarMetrics()).rejects.toThrow("SonarCloud HTTP 500")
  })
})

describe("fetchScorecard", () => {
  it("returns the aggregate score", async () => {
    stubFetch({ score: 9.3 })

    await expect(fetchScorecard()).resolves.toBe(9.3)
  })

  it("throws on a non-OK response", async () => {
    stubFetch({}, { ok: false, status: 404 })

    await expect(fetchScorecard()).rejects.toThrow("OpenSSF Scorecard HTTP 404")
  })

  it("throws when the score is missing or not a number", async () => {
    stubFetch({})
    await expect(fetchScorecard()).rejects.toThrow("missing score")

    stubFetch({ score: "9" })
    await expect(fetchScorecard()).rejects.toThrow("missing score")
  })
})

describe("fetchSystemStatus", () => {
  it("fetches Sonar and Scorecard values for build-time rendering", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("sonarcloud.io")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                component: {
                  measures: [
                    { metric: "security_rating", value: "1.0" },
                    { metric: "reliability_rating", value: "2.0" },
                    { metric: "sqale_index", value: "90" },
                    { metric: "coverage", value: "95.2" },
                  ],
                },
              }),
          })
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ score: 9.1 }) })
      })
    )

    await expect(fetchSystemStatus()).resolves.toEqual({
      sonar: {
        security: "A",
        reliability: "B",
        technicalDebt: "1h 30min",
        coverage: "95.2%",
      },
      scorecard: 9.1,
    })
  })

  it("falls back per metric when one public API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("sonarcloud.io")) {
          return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ score: 8.4 }) })
      })
    )

    await expect(fetchSystemStatus()).resolves.toEqual({
      sonar: DEFAULT_SONAR_METRICS,
      scorecard: 8.4,
    })
  })

  it("falls back when public APIs do not respond before the build timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        const signal = init?.signal
        return new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
        })
      })
    )

    await expect(fetchSystemStatus({ timeoutMs: 1 })).resolves.toEqual({
      sonar: DEFAULT_SONAR_METRICS,
      scorecard: DEFAULT_SCORECARD_SCORE,
    })
  })
})

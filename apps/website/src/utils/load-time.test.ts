import { formatMilliseconds, LOAD_TIME_PLACEHOLDER } from "utils/load-time"

describe("formatMilliseconds", () => {
  it("rounds to whole milliseconds", () => {
    expect(formatMilliseconds(412)).toBe("412")
    expect(formatMilliseconds(411.4)).toBe("411")
    expect(formatMilliseconds(411.5)).toBe("412")
    expect(formatMilliseconds(0)).toBe("0")
  })

  it("groups thousands so a slow connection still reads as a number", () => {
    expect(formatMilliseconds(1240)).toBe("1,240")
    expect(formatMilliseconds(12_345.6)).toBe("12,346")
  })

  it("falls back to the placeholder for values a timing API should never produce", () => {
    expect(formatMilliseconds(Number.NaN)).toBe(LOAD_TIME_PLACEHOLDER)
    expect(formatMilliseconds(Number.POSITIVE_INFINITY)).toBe(LOAD_TIME_PLACEHOLDER)
    expect(formatMilliseconds(-1)).toBe(LOAD_TIME_PLACEHOLDER)
  })
})

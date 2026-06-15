import { formatBlogDate } from "utils/blog"

// Dates are stored as plain `YYYY-MM-DD` strings; formatting is pinned to UTC so
// the displayed day never drifts with the machine's timezone.
describe("formatBlogDate", () => {
  it("formats an ISO date as a long, human date", () => {
    expect(formatBlogDate("2026-06-08")).toBe("June 8, 2026")
  })

  it("does not drift across month or year boundaries", () => {
    expect(formatBlogDate("2026-01-01")).toBe("January 1, 2026")
    expect(formatBlogDate("2025-12-31")).toBe("December 31, 2025")
  })
})

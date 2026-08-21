// Formatting for the footer panel's live "Loaded in <n> ms" heading.
//
// The measurement itself lives in Footer.astro (a PerformanceObserver on
// `largest-contentful-paint`, plus the view-transition timings); this module stays
// DOM-free so the formatting rules can be unit-tested under jsdom.

/** Rendered when no usable timing is available, matching the em dash used by `formatCoverage`. */
export const LOAD_TIME_PLACEHOLDER = "—"

// Whole milliseconds only — sub-millisecond precision is noise to a reader, and the
// heading is grouped ("1,240") so a slow connection still reads as a number rather
// than a run of digits. Negative values are impossible from a monotonic clock but
// would render nonsense if a timing origin ever drifted, so they fall back too.
export const formatMilliseconds = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) return LOAD_TIME_PLACEHOLDER
  return Math.round(ms).toLocaleString("en-US")
}

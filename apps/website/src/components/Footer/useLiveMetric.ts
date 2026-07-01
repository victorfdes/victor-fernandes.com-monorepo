import { useEffect, useState } from "react"
import { readCache, writeCache } from "utils/system-status"

export interface LiveMetric<T> {
  /** The cached value, then the baseline, then the live value once it arrives. */
  value: T
  /** True while a fetch is in flight, so the UI can show a subtle "live" indicator. */
  isRefreshing: boolean
}

// Stale-while-revalidate for a single footer metric: render the baseline immediately (so
// SSR and hydration agree), then on mount swap in any cached value and revalidate against
// the live API. A failed fetch keeps the existing value, so the footer degrades silently
// rather than ever showing an error.
// `fetcher` must be a stable reference (e.g. a module-level function) to avoid refetch loops.
export const useLiveMetric = <T>(
  cacheKey: string,
  baseline: T,
  fetcher: (signal: AbortSignal) => Promise<T>
): LiveMetric<T> => {
  // Start from the baseline so the first client render matches the server markup; the
  // cached value is applied in the effect below (post-hydration) to avoid a mismatch.
  const [value, setValue] = useState<T>(baseline)
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsRefreshing(true)

    // Show the last cached value instantly when navigating between pages.
    const cached = readCache(cacheKey) as T | undefined
    if (cached !== undefined) setValue(cached)

    fetcher(controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setValue(next)
        writeCache(cacheKey, next)
      })
      .catch(() => {
        // Network or parse failure — keep the baseline/cached value, no visitor-facing error.
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRefreshing(false)
      })

    return () => controller.abort()
  }, [cacheKey, fetcher])

  return { value, isRefreshing }
}

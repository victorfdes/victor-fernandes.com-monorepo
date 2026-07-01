import { useEffect, useState } from "react"
import { readCache, writeCache } from "utils/system-status"

export interface LiveMetric<T> {
  /** The cached value, then the baseline, then the live value once it arrives. */
  value: T
  /** True while a fetch is in flight, so the UI can show a subtle "live" indicator. */
  isRefreshing: boolean
}

// Stale-while-revalidate for a single footer metric: render the baseline (or a cached
// value) immediately, then revalidate against the live API on mount. A failed fetch keeps
// the existing value, so the footer degrades silently rather than ever showing an error.
// `fetcher` must be a stable reference (e.g. a module-level function) to avoid refetch loops.
export const useLiveMetric = <T>(
  cacheKey: string,
  baseline: T,
  fetcher: (signal: AbortSignal) => Promise<T>
): LiveMetric<T> => {
  const [value, setValue] = useState<T>(() => (readCache(cacheKey) as T | undefined) ?? baseline)
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsRefreshing(true)

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

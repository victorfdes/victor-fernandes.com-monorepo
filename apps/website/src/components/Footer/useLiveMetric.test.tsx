import { renderHook, waitFor } from "@testing-library/react"
import { readCache, writeCache } from "utils/system-status"
import { useLiveMetric } from "./useLiveMetric"

describe("useLiveMetric", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("renders the baseline first, then revalidates to the live value", async () => {
    const fetcher = vi.fn().mockResolvedValue("live")

    const { result } = renderHook(() => useLiveMetric("metric", "baseline", fetcher))

    expect(result.current.value).toBe("baseline")
    expect(result.current.isRefreshing).toBe(true)

    await waitFor(() => expect(result.current.value).toBe("live"))
    expect(result.current.isRefreshing).toBe(false)
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it("seeds the initial value from a cached entry", async () => {
    writeCache("cached", "from-cache")
    const fetcher = vi.fn().mockResolvedValue("live")

    const { result } = renderHook(() => useLiveMetric("cached", "baseline", fetcher))

    expect(result.current.value).toBe("from-cache")

    // Let the on-mount revalidation settle so its state update stays inside act().
    await waitFor(() => expect(result.current.isRefreshing).toBe(false))
  })

  it("persists the live value to the cache", async () => {
    const fetcher = vi.fn().mockResolvedValue("live")

    renderHook(() => useLiveMetric("persist", "baseline", fetcher))

    await waitFor(() => expect(readCache("persist")).toBe("live"))
  })

  it("keeps the current value when the fetch fails", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network"))

    const { result } = renderHook(() => useLiveMetric("metric", "baseline", fetcher))

    await waitFor(() => expect(result.current.isRefreshing).toBe(false))
    expect(result.current.value).toBe("baseline")
  })
})

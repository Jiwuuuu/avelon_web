import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "./api"

type CacheEntry<T> = { data: T; fetchedAt: number }

// Module-level cache shared across all hook instances
const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Fetches data from an API endpoint with client-side caching.
 * If cached data exists and is fresher than `staleMs`, it returns
 * the cached value without hitting the server.
 *
 * @param url      API path (e.g. "/api/v1/admin/users")
 * @param staleMs  How long cached data is considered fresh (default 30 s)
 */
export function useCachedFetch<T>(url: string, staleMs = 30_000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Track latest URL to avoid stale closures
  const urlRef = useRef(url)
  urlRef.current = url

  const fetchData = useCallback(
    async (bypassCache = false) => {
      const key = urlRef.current

      // Serve from cache if still fresh
      if (!bypassCache) {
        const cached = cache.get(key) as CacheEntry<T> | undefined
        if (cached && Date.now() - cached.fetchedAt < staleMs) {
          setData(cached.data)
          setLoading(false)
          setError(null)
          return
        }
      }

      setLoading(true)
      setError(null)

      try {
        const result = await api.get<T>(key)
        if (result.success && result.data) {
          cache.set(key, { data: result.data, fetchedAt: Date.now() })
          setData(result.data)
        } else {
          setError(result.message ?? "Request failed")
        }
      } catch {
        setError("Failed to connect to server")
      } finally {
        setLoading(false)
      }
    },
    [staleMs],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData, url])

  /** Force a fresh fetch, bypassing the cache */
  const refresh = useCallback(() => fetchData(true), [fetchData])

  /** Evict this URL from cache (useful after mutations) */
  const invalidate = useCallback(() => {
    cache.delete(urlRef.current)
  }, [])

  return { data, loading, error, refresh, invalidate }
}

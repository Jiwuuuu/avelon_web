import { useCallback, useEffect, useState } from "react"
import { api } from "./api"

const CHANGED = "avelon:notifications-changed"
const POLL_MS = 30_000

/** Call after marking notifications read so every badge refreshes at once. */
export function announceNotificationsChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGED))
}

/** The signed-in user's unread notification count, kept fresh while the tab is open. */
export function useUnreadCount() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = (await api.get<unknown[]>("/api/v1/notifications?limit=1")) as { success: boolean; meta?: { unreadCount?: number } }
      if (res.success) setCount(res.meta?.unreadCount ?? 0)
    } catch {
      // A missed poll keeps the last count
    }
  }, [])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh()
    }, POLL_MS)
    window.addEventListener(CHANGED, refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener(CHANGED, refresh)
    }
  }, [refresh])

  return count
}

"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Bell, Search, ChevronLeft, ChevronRight, Mail, MailOpen,
  Shield, CreditCard, AlertTriangle, Megaphone, Wallet, Clock,
} from "lucide-react"
import { api } from "@/lib/api"

/* ── Types ────────────────────────────────────────────────── */
type Notification = {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  user: { email: string; name: string | null }
}

type Meta = { total: number; page: number; limit: number; totalPages: number }

/* ── Constants ────────────────────────────────────────────── */
const ITEMS_PER_PAGE = 20

const TYPE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "KYC", label: "KYC" },
  { key: "LOAN", label: "Loans" },
  { key: "COLLATERAL", label: "Collateral" },
  { key: "REPAYMENT", label: "Repayment" },
  { key: "LIQUIDATION", label: "Liquidation" },
  { key: "SYSTEM", label: "System" },
  { key: "EMAIL", label: "Email" },
] as const

const READ_FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
] as const

function getTypeIcon(type: string) {
  if (type.startsWith("KYC")) return { icon: Shield, color: "text-blue-500", bg: "bg-blue-50" }
  if (type.startsWith("LOAN")) return { icon: CreditCard, color: "text-purple-500", bg: "bg-purple-50" }
  if (type.startsWith("COLLATERAL")) return { icon: Wallet, color: "text-amber-500", bg: "bg-amber-50" }
  if (type.startsWith("REPAYMENT")) return { icon: Clock, color: "text-green-500", bg: "bg-green-50" }
  if (type.startsWith("LIQUIDATION")) return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" }
  if (type.startsWith("SYSTEM")) return { icon: Megaphone, color: "text-orange-500", bg: "bg-orange-50" }
  if (type.startsWith("EMAIL")) return { icon: Mail, color: "text-cyan-500", bg: "bg-cyan-50" }
  return { icon: Bell, color: "text-gray-500", bg: "bg-gray-50" }
}

/* ── Component ────────────────────────────────────────────── */
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("all")
  const [readFilter, setReadFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) })
      if (category !== "all") params.set("type", category)
      if (readFilter === "unread") params.set("unread", "true")
      if (readFilter === "read") params.set("unread", "false")

      const result = await api.get<{ data: Notification[]; meta: Meta }>(`/api/v1/admin/notifications?${params}`)
      if (result.success && result.data) {
        setNotifications(result.data.data ?? (result.data as unknown as Notification[]))
        // The list is data; the counts and pages sit beside it in meta
        setMeta((result as { meta?: Meta }).meta ?? result.data.meta ?? null)
      } else {
        setError(result.message ?? "Failed to load notifications")
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }, [page, category, readFilter])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  /* ── Client-side search over fetched page ───────────────── */
  const filtered = useMemo(() => {
    if (!searchTerm) return notifications
    const q = searchTerm.toLowerCase()
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.user.email.toLowerCase().includes(q) ||
        (n.user.name ?? "").toLowerCase().includes(q),
    )
  }, [notifications, searchTerm])

  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">View all user notifications across the platform.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1 overflow-x-auto">
            {TYPE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => { setCategory(cat.key); setPage(1) }}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${category === cat.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + read filter */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-56">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={16} /></span>
              <input
                type="text"
                placeholder="Search title, user…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <select
              value={readFilter}
              onChange={(e) => { setReadFilter(e.target.value); setPage(1) }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              {READ_FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-100 p-4 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchNotifications} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {/* Notification List */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
                <Bell size={48} className="mx-auto text-gray-300" />
                <p className="mt-4 text-lg font-medium text-gray-700">No notifications found</p>
                <p className="text-sm text-gray-400 mt-1">Adjust your filters or check back later.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((n) => {
                  const { icon: Icon, color, bg } = getTypeIcon(n.type)
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-4 rounded-xl border bg-white p-4 transition hover:shadow-sm ${n.isRead ? "border-gray-100" : "border-orange-200 bg-orange-50/30"}`}
                    >
                      <div className={`flex-shrink-0 rounded-full p-2.5 ${bg}`}>
                        <Icon size={18} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                          {!n.isRead && <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                          <span>{n.user.name ?? n.user.email}</span>
                          <span>·</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                          <span>·</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">{n.type.replace(/_/g, " ")}</span>
                          {n.isRead ? (
                            <span className="inline-flex items-center gap-1 text-green-500"><MailOpen size={12} /> Read</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-orange-500"><Mail size={12} /> Unread</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <span>Page {page} of {totalPages} ({meta?.total ?? 0} total)</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50">Next <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

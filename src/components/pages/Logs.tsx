"use client"

import { useState, useMemo, useEffect, useCallback, Fragment } from "react"
import {
  ScrollText, Search, ChevronLeft, ChevronRight, Filter,
  LogIn, Shield, CreditCard, Wallet, UserCog, Settings, Eye,
} from "lucide-react"
import { api } from "@/lib/api"

/* ── Types ────────────────────────────────────────────────── */
type AuditLog = {
  id: string
  userId: string | null
  action: string
  entity: string | null
  entityId: string | null
  ipAddress: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  user: { email: string; name: string | null } | null
}

type Meta = { total: number; page: number; limit: number; totalPages: number }

/* ── Constants ────────────────────────────────────────────── */
const ITEMS_PER_PAGE = 30

const CATEGORY_TABS = [
  { key: "all", label: "All Logs", icon: ScrollText },
  { key: "LOGIN", label: "Auth", icon: LogIn },
  { key: "KYC", label: "KYC", icon: Shield },
  { key: "LOAN", label: "Loans", icon: CreditCard },
  { key: "WALLET", label: "Wallet", icon: Wallet },
  { key: "USER", label: "Users", icon: UserCog },
  { key: "ADMIN", label: "Admin", icon: Settings },
] as const

function getActionStyle(action: string) {
  if (action.startsWith("LOGIN") || action === "LOGOUT") return { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" }
  if (action.startsWith("KYC")) return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" }
  if (action.startsWith("LOAN")) return { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" }
  if (action.startsWith("WALLET") || action.startsWith("DEPOSIT") || action.startsWith("WITHDRAW")) return { color: "text-green-700", bg: "bg-green-50", border: "border-green-200" }
  if (action.startsWith("USER") || action.startsWith("PROFILE")) return { color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200" }
  if (action.startsWith("ADMIN")) return { color: "text-red-700", bg: "bg-red-50", border: "border-red-200" }
  return { color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" }
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/* ── Component ────────────────────────────────────────────── */
export default function Logs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) })
      if (category !== "all") params.set("action", category)
      if (searchTerm.trim()) params.set("search", searchTerm.trim())

      const result = await api.get<{ data: AuditLog[]; meta: Meta }>(`/api/v1/admin/audit-logs?${params}`)
      if (result.success && result.data) {
        setLogs(result.data.data ?? (result.data as unknown as AuditLog[]))
        setMeta(result.data.meta ?? null)
      } else {
        setError(result.message ?? "Failed to load logs")
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }, [page, category, searchTerm])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  /* ── Stats from current page ────────────────────────────── */
  const stats = useMemo(() => {
    const uniqueUsers = new Set(logs.map((l) => l.userId).filter(Boolean)).size
    return { total: meta?.total ?? 0, pageCount: logs.length, uniqueUsers }
  }, [logs, meta])

  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-500">Categorized system activity logs with full traceability.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="rounded-lg bg-white border border-gray-200 px-3 py-2"><strong className="text-gray-900">{stats.total}</strong> total logs</span>
            <span className="rounded-lg bg-white border border-gray-200 px-3 py-2"><strong className="text-gray-900">{stats.uniqueUsers}</strong> users on page</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setCategory(tab.key); setPage(1) }}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${category === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={16} /></span>
            <input
              type="text"
              placeholder="Search by user email…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              onKeyDown={(e) => { if (e.key === "Enter") fetchLogs() }}
              className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            <Filter size={14} /> Apply Filters
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-5 py-4">
                  <div className="h-8 w-20 rounded bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-1/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchLogs} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {/* Log Table */}
        {!loading && !error && (
          <>
            {logs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
                <ScrollText size={48} className="mx-auto text-gray-300" />
                <p className="mt-4 text-lg font-medium text-gray-700">No logs found</p>
                <p className="text-sm text-gray-400 mt-1">Adjust your category or search filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                      <th className="px-5 py-3 font-medium">Action</th>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Entity</th>
                      <th className="px-5 py-3 font-medium">IP Address</th>
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const style = getActionStyle(log.action)
                      const isExpanded = expandedLog === log.id
                      return (
                        <Fragment key={log.id}>
                          <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                            <td className="px-5 py-3">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${style.bg} ${style.color} ${style.border}`}>
                                {formatAction(log.action)}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {log.user ? (
                                <div>
                                  <p className="font-medium text-gray-900 truncate max-w-[180px]">{log.user.name ?? "—"}</p>
                                  <p className="text-xs text-gray-400 truncate max-w-[180px]">{log.user.email}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">System</span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              {log.entity ? (
                                <div>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{log.entity}</span>
                                  {log.entityId && <p className="text-[11px] text-gray-400 mt-0.5 font-mono truncate max-w-[120px]">{log.entityId}</p>}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-600 font-mono text-xs">{log.ipAddress ?? "—"}</td>
                            <td className="px-5 py-3">
                              <p className="text-gray-700 font-medium">{relativeTime(log.createdAt)}</p>
                              <p className="text-[11px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                              {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                                >
                                  <Eye size={16} />
                                </button>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && log.metadata && (
                            <tr className="bg-gray-50">
                              <td colSpan={6} className="px-5 py-3">
                                <pre className="text-xs text-gray-600 font-mono bg-white rounded-lg border border-gray-200 p-3 overflow-x-auto max-h-40">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <span>Page {page} of {totalPages} ({meta?.total ?? 0} total logs)</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else if (page <= 4) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = page - 3 + i
                    }
                    return (
                      <button key={pageNum} type="button" onClick={() => setPage(pageNum)} className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${pageNum === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{pageNum}</button>
                    )
                  })}
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

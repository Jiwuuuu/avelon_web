"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, PlusCircle, Search, Coins, TrendingUp, Shield, Percent, LayoutGrid, List } from "lucide-react"
import type { LoanPlan } from "@/types"
import { api } from "@/lib/api"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { LoanPlansSkeleton } from "@/components/skeletons"
import {
  PlanCard, PlanTable, PlanDetailModal, CreatePlanModal, DeleteConfirmDialog, Toast,
  ITEMS_PER_PAGE, SORT_OPTIONS, type StatusFilter, type ToastState, type ConfirmAction,
} from "@/components/loan-plans"

export default function LoanPlans() {
  const { data: plansData, loading, error, refresh, invalidate } = useCachedFetch<{ plans: LoanPlan[] }>("/api/v1/admin/plans")
  const plans = plansData?.plans ?? []

  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("newest")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [deleteConfirm, setDeleteConfirm] = useState<{ planId: string; action: ConfirmAction } | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  /* ── Toast auto-dismiss ─────────────────────────────────── */
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  /* ── Derived stats ──────────────────────────────────────── */
  const stats = useMemo(() => {
    const active = plans.filter((p) => p.isActive).length
    const avgRate = plans.length ? (plans.reduce((s, p) => s + p.interestRate, 0) / plans.length).toFixed(1) : "0"
    return { total: plans.length, active, inactive: plans.length - active, avgRate }
  }, [plans])

  /* ── Filtering & sorting ────────────────────────────────── */
  const filteredPlans = useMemo(() => {
    const q = searchTerm.toLowerCase()
    const filtered = plans.filter((plan) => {
      if (statusFilter === "active" && !plan.isActive) return false
      if (statusFilter === "inactive" && plan.isActive) return false
      if (!q) return true
      return plan.name.toLowerCase().includes(q) || (plan.description ?? "").toLowerCase().includes(q)
    })
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "amount-desc": return b.maxAmount - a.maxAmount
        case "amount-asc": return a.minAmount - b.minAmount
        case "rate-desc": return b.interestRate - a.interestRate
        case "rate-asc": return a.interestRate - b.interestRate
        case "name": return a.name.localeCompare(b.name)
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [plans, searchTerm, sortOption, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / ITEMS_PER_PAGE))
  const visiblePlans = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPlans.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage, filteredPlans])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [currentPage, totalPages])

  /* ── Handlers ───────────────────────────────────────────── */
  const handleDeactivatePlan = useCallback(async (planId: string, planName: string) => {
    try {
      const result = await api.delete<{ message: string }>(`/api/v1/admin/plans/${planId}`)
      if (result.success) {
        invalidate()
        await refresh()
        setSelectedPlan(null)
        setDeleteConfirm(null)
        setToast({ type: "success", message: `"${planName}" has been deactivated.` })
      }
    } catch {
      setToast({ type: "error", message: "Failed to deactivate plan." })
    }
  }, [invalidate, refresh])

  const handlePermanentDelete = useCallback(async (planId: string, planName: string) => {
    try {
      const result = await api.delete<{ message: string }>(`/api/v1/admin/plans/${planId}/permanent`)
      if (result.success) {
        invalidate()
        await refresh()
        setSelectedPlan(null)
        setDeleteConfirm(null)
        setToast({ type: "success", message: `"${planName}" has been permanently deleted.` })
      } else {
        setDeleteConfirm(null)
        setToast({ type: "error", message: result.message ?? "Cannot delete plan." })
      }
    } catch {
      setDeleteConfirm(null)
      setToast({ type: "error", message: "Failed to delete plan. It may have associated loans." })
    }
  }, [invalidate, refresh])

  const handleDeactivateFromDetail = useCallback((planId: string) => {
    setDeleteConfirm({ planId, action: "deactivate" })
    setSelectedPlan(null)
  }, [])

  const handleDeleteFromDetail = useCallback((planId: string) => {
    setDeleteConfirm({ planId, action: "delete" })
    setSelectedPlan(null)
  }, [])

  /* ── Tab config ─────────────────────────────────────────── */
  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All Plans", count: stats.total },
    { key: "active", label: "Active", count: stats.active },
    { key: "inactive", label: "Inactive", count: stats.inactive },
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-6">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Plans</h1>
            <p className="text-sm text-gray-500">Manage credit products available to borrowers.</p>
          </div>
          <button type="button" onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
            <PlusCircle size={18} /> Add Loan Plan
          </button>
        </div>

        {/* ── Summary Cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Coins size={16} />} label="Total Plans" value={stats.total} />
          <StatCard icon={<TrendingUp size={16} />} label="Active" value={stats.active} valueColor="text-green-700" iconColor="text-green-500" />
          <StatCard icon={<Shield size={16} />} label="Inactive" value={stats.inactive} valueColor="text-gray-500" />
          <StatCard icon={<Percent size={16} />} label="Avg Rate" value={`${stats.avgRate}%`} iconColor="text-orange-500" />
        </div>

        {/* ── Toolbar ────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => { setStatusFilter(tab.key); setCurrentPage(1) }} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${statusFilter === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {tab.label} <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-56">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={16} /></span>
              <input type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button type="button" onClick={() => setViewMode("grid")} className={`p-2.5 transition ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}><LayoutGrid size={16} /></button>
              <button type="button" onClick={() => setViewMode("table")} className={`p-2.5 transition ${viewMode === "table" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* ── Loading / Error ────────────────────────────── */}
        {loading && <LoanPlansSkeleton />}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {/* ── Plans Content ──────────────────────────────── */}
        {!loading && !error && (
          <>
            {visiblePlans.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
                <Coins size={48} className="mx-auto text-gray-300" />
                <p className="mt-4 text-lg font-medium text-gray-700">No plans found</p>
                <p className="text-sm text-gray-400 mt-1">{searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : "Create your first loan plan to get started."}</p>
                {!searchTerm && statusFilter === "all" && (
                  <button type="button" onClick={() => setIsAddModalOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"><PlusCircle size={18} /> Create Plan</button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visiblePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onView={setSelectedPlan} onDeactivate={(id) => setDeleteConfirm({ planId: id, action: "deactivate" })} onDelete={(id) => setDeleteConfirm({ planId: id, action: "delete" })} />
                ))}
              </div>
            ) : (
              <PlanTable plans={visiblePlans} onView={setSelectedPlan} onDeactivate={(id) => setDeleteConfirm({ planId: id, action: "deactivate" })} onDelete={(id) => setDeleteConfirm({ planId: id, action: "delete" })} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <span>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPlans.length)} of {filteredPlans.length} plans</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    if (totalPages > 7 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                      if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-gray-300">…</span>
                      return null
                    }
                    return <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${page === currentPage ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{page}</button>
                  })}
                  <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50">Next <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Overlays ──────────────────────────────────────── */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {deleteConfirm && (
        <DeleteConfirmDialog
          action={deleteConfirm.action}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => {
            const plan = plans.find((p) => p.id === deleteConfirm.planId)
            if (plan) {
              if (deleteConfirm.action === "delete") {
                handlePermanentDelete(plan.id, plan.name)
              } else {
                handleDeactivatePlan(plan.id, plan.name)
              }
            }
          }}
        />
      )}

      {isAddModalOpen && (
        <CreatePlanModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(msg) => setToast({ type: "success", message: msg })}
          onError={(msg) => setToast({ type: "error", message: msg })}
          invalidate={invalidate}
          refresh={refresh}
        />
      )}

      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onDeactivate={handleDeactivateFromDetail}
          onDelete={handleDeleteFromDetail}
        />
      )}
    </div>
  )
}

/* ── Small stat card used in the summary row ──────────────── */
function StatCard({ icon, label, value, valueColor = "text-gray-900", iconColor = "text-gray-400" }: {
  icon: React.ReactNode; label: string; value: string | number; valueColor?: string; iconColor?: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <span className={iconColor}>{icon}</span>
        <span className="text-xs uppercase tracking-wide text-gray-400">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}

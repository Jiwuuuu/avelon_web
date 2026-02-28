"use client"

import { useMemo, useState, useEffect } from "react"
import type { FormEvent } from "react"
import { ChevronLeft, ChevronRight, PlusCircle, Search, Trash2, X, Loader2 } from "lucide-react"
import { type LoanPlan, type CreateLoanPlanInput, InterestType } from "@avelon_capstone/types"
import { api } from "@/lib/api"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { LoanPlansSkeleton } from "@/components/skeletons"

const ITEMS_PER_PAGE = 6

export default function LoanPlans() {
  const { data: plansData, loading, error, refresh, invalidate } = useCachedFetch<{ plans: LoanPlan[] }>("/api/v1/admin/plans")
  const plans = plansData?.plans ?? []
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("newest")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredPlans = useMemo(() => {
    const normalized = searchTerm.toLowerCase()
    const filtered = plans.filter((plan) => {
      if (!normalized) return true
      return plan.name.toLowerCase().includes(normalized) || (plan.description ?? "").toLowerCase().includes(normalized)
    })

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "amount-desc":
          return b.maxAmount - a.maxAmount
        case "amount-asc":
          return a.minAmount - b.minAmount
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [plans, searchTerm, sortOption])

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / ITEMS_PER_PAGE))
  const visiblePlans = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPlans.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage, filteredPlans])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [currentPage, totalPages])

  const handleCreatePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const form = event.currentTarget
    const data = new FormData(form)

    const input: CreateLoanPlanInput = {
      name: data.get("name") as string,
      description: (data.get("description") as string) || undefined,
      minCreditScore: Number(data.get("minCreditScore")) || 0,
      minAmount: Number(data.get("minAmount")) || 0,
      maxAmount: Number(data.get("maxAmount")) || 0,
      durationOptions: (data.get("durationOptions") as string).split(",").map((d) => Number(d.trim())).filter(Boolean),
      interestRate: Number(data.get("interestRate")) || 0,
      interestType: (data.get("interestType") as InterestType) || InterestType.FLAT,
      collateralRatio: Number(data.get("collateralRatio")) || 150,
      originationFee: Number(data.get("originationFee")) || 0,
      gracePeriodDays: Number(data.get("gracePeriodDays")) || 0,
    }

    try {
      const result = await api.post<LoanPlan>("/api/v1/admin/plans", input)
      if (result.success) {
        invalidate()
        await refresh()
        setIsAddModalOpen(false)
        form.reset()
      }
    } catch {
      // Silently handle
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      const result = await api.delete<{ message: string }>(`/api/v1/admin/plans/${planId}`)
      if (result.success) {
        invalidate()
        await refresh()
        setSelectedPlan(null)
      }
    } catch {
      // Silently handle
    }
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Plans</h1>
            <p className="text-sm text-gray-500">Manage credit products available to borrowers.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search plans"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="newest">Newest first</option>
              <option value="amount-desc">Max Amount: High to Low</option>
              <option value="amount-asc">Min Amount: Low to High</option>
              <option value="name">Alphabetical</option>
            </select>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
            >
              <PlusCircle size={18} /> Add Loan Plan
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <LoanPlansSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {/* Plan Cards */}
        {!loading && !error && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visiblePlans.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                  No loan plans match your filters.
                </div>
              )}
              {visiblePlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{plan.description ?? "No description"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${plan.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-xs uppercase text-gray-400">Amount Range (ETH)</p>
                      <p className="text-xl font-semibold text-gray-900">{plan.minAmount} — {plan.maxAmount}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>
                        <p className="text-xs uppercase text-gray-400">Durations (days)</p>
                        <p className="font-medium text-gray-900">{plan.durationOptions.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase text-gray-400">APR</p>
                        <p className="font-medium text-gray-900">{plan.interestRate}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>
                        <p className="text-xs uppercase text-gray-400">Collateral Ratio</p>
                        <p className="font-medium text-gray-900">{plan.collateralRatio}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase text-gray-400">Min Credit</p>
                        <p className="font-medium text-gray-900">{plan.minCreditScore}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <span>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPlans.length)} of {filteredPlans.length} plans
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    return (
                      <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${page === currentPage ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{page}</button>
                    )
                  })}
                  <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50">Next <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Create New Loan Plan</h2>
                <p className="text-sm text-gray-500">Configure the plan terms before publishing.</p>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Plan Name *
                  <input name="name" type="text" required placeholder="e.g. Growth Accelerator" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Min Credit Score *
                  <input name="minCreditScore" type="number" required min="0" max="100" placeholder="50" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Min Amount (ETH) *
                  <input name="minAmount" type="number" required min="0" step="0.01" placeholder="0.1" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Max Amount (ETH) *
                  <input name="maxAmount" type="number" required min="0" step="0.01" placeholder="10" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Duration Options (days, comma-sep) *
                  <input name="durationOptions" type="text" required placeholder="30, 60, 90" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Interest Rate (%) *
                  <input name="interestRate" type="number" required min="0" step="0.1" placeholder="5.0" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Collateral Ratio (%) *
                  <input name="collateralRatio" type="number" required min="100" placeholder="150" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Origination Fee (%) *
                  <input name="originationFee" type="number" required min="0" step="0.1" placeholder="1.0" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Interest Type
                  <select name="interestType" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" defaultValue={InterestType.FLAT}>
                    <option value={InterestType.FLAT}>Flat</option>
                    <option value={InterestType.COMPOUND}>Compound</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Grace Period (days)
                  <input name="gracePeriodDays" type="number" min="0" placeholder="7" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </div>

              <label className="text-sm font-medium text-gray-700">
                Description
                <textarea name="description" rows={2} placeholder="Brief description of this plan." className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              </label>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-sm font-medium text-gray-500 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Loan Plan</p>
                <h3 className="text-3xl font-semibold text-gray-900">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-500">{selectedPlan.description ?? "No description"}</p>
              </div>
              <button type="button" onClick={() => setSelectedPlan(null)} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900"><X size={16} /></button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Amount Range (ETH)</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.minAmount} — {selectedPlan.maxAmount}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Duration Options (days)</p>
                <p className="text-xl font-semibold text-gray-900">{selectedPlan.durationOptions.join(", ")}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">APR</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.interestRate}%</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Collateral Ratio</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.collateralRatio}%</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Min Credit Score</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.minCreditScore}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Origination Fee</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.originationFee}%</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Status</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Grace Period</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.gracePeriodDays} days</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => setSelectedPlan(null)} className="text-sm font-medium text-gray-600 hover:text-gray-900">Close</button>
              <button type="button" onClick={() => handleDeletePlan(selectedPlan.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 size={18} /> Deactivate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { ShieldCheck, AlertTriangle, Activity, Clock } from "lucide-react"
import { LoanStatus as LoanStatusEnum, CollateralHealth, type Loan } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { LoanStatusSkeleton } from "@/components/skeletons"

// ── Status & Health Badges ───────────────────────────────
const statusStyles: Record<LoanStatusEnum, string> = {
  [LoanStatusEnum.PENDING_COLLATERAL]: "bg-yellow-50 text-yellow-700",
  [LoanStatusEnum.COLLATERAL_DEPOSITED]: "bg-blue-50 text-blue-700",
  [LoanStatusEnum.ACTIVE]: "bg-green-50 text-green-700",
  [LoanStatusEnum.REPAID]: "bg-emerald-50 text-emerald-700",
  [LoanStatusEnum.LIQUIDATED]: "bg-red-50 text-red-700",
  [LoanStatusEnum.CANCELLED]: "bg-gray-100 text-gray-600",
  [LoanStatusEnum.EXPIRED]: "bg-gray-200 text-gray-600",
}

const healthStyles: Record<CollateralHealth, string> = {
  [CollateralHealth.HEALTHY]: "text-emerald-600",
  [CollateralHealth.WARNING]: "text-amber-600",
  [CollateralHealth.CRITICAL]: "text-rose-600",
  [CollateralHealth.LIQUIDATION]: "text-red-800 font-bold",
}

function getCollateralHealth(loan: Loan): CollateralHealth {
  if (loan.collateralRequired === 0) return CollateralHealth.HEALTHY
  const ratio = (loan.collateralDeposited / loan.collateralRequired) * 100
  if (ratio >= 150) return CollateralHealth.HEALTHY
  if (ratio >= 130) return CollateralHealth.WARNING
  if (ratio >= 120) return CollateralHealth.CRITICAL
  return CollateralHealth.LIQUIDATION
}

export default function LoanStatus() {
  const { data: loansData, loading, error, refresh } = useCachedFetch<{ loans: Loan[] }>("/api/v1/admin/loans")
  const loans = loansData?.loans ?? []

  // Compute stats from actual data
  const activeLoans = loans.filter((l) => l.status === LoanStatusEnum.ACTIVE)
  const pendingLoans = loans.filter((l) => l.status === LoanStatusEnum.PENDING_COLLATERAL || l.status === LoanStatusEnum.COLLATERAL_DEPOSITED)
  const liquidatedLoans = loans.filter((l) => l.status === LoanStatusEnum.LIQUIDATED)
  const repaidLoans = loans.filter((l) => l.status === LoanStatusEnum.REPAID)

  const portfolioSnapshot = [
    { label: "Active Loans", value: String(activeLoans.length), icon: ShieldCheck, accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending", value: String(pendingLoans.length), icon: Clock, accent: "text-amber-500", bg: "bg-amber-50" },
    { label: "Liquidated", value: String(liquidatedLoans.length), icon: AlertTriangle, accent: "text-rose-500", bg: "bg-rose-50" },
    { label: "Repaid", value: String(repaidLoans.length), icon: Activity, accent: "text-indigo-600", bg: "bg-indigo-50" },
  ]

  // Show active + pending loans in the pipeline
  const pipelineLoans = loans.filter((l) =>
    [LoanStatusEnum.ACTIVE, LoanStatusEnum.PENDING_COLLATERAL, LoanStatusEnum.COLLATERAL_DEPOSITED].includes(l.status),
  )

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Loan Status</h1>
          <p className="text-sm text-gray-500">Track repayment health, collateral ratios, and loan lifecycle stages.</p>
        </div>

        {/* Loading / Error */}
        {loading && <LoanStatusSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {portfolioSnapshot.map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-2xl ${item.bg} p-3`}>
                      <item.icon size={18} className={item.accent} />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline Table */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">Active Pipeline</h2>
                <p className="text-sm text-gray-500">Loans currently active or awaiting collateral.</p>
              </div>

              <div className="mt-6 space-y-4 text-sm text-gray-700">
                <div className="hidden grid-cols-[1.5fr,1fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
                  <span>Loan ID</span>
                  <span>Principal</span>
                  <span>Collateral</span>
                  <span>Due Date</span>
                  <span>Status / Health</span>
                </div>

                {pipelineLoans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No active loans in pipeline.</div>
                )}

                {pipelineLoans.map((loan) => {
                  const health = getCollateralHealth(loan)
                  return (
                    <div
                      key={loan.id}
                      className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-md md:grid-cols-[1.5fr,1fr,1fr,1fr,1fr]"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 font-mono text-xs">{loan.id.slice(0, 12)}...</p>
                        <p className="text-xs text-gray-500">User: {loan.userId.slice(0, 8)}...</p>
                      </div>
                      <div className="font-semibold text-gray-900">{loan.principal} ETH</div>
                      <div>
                        <p className="font-semibold text-gray-900">{loan.collateralDeposited} / {loan.collateralRequired} ETH</p>
                        <p className={`text-xs font-medium ${healthStyles[health]}`}>{health}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "—"}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[loan.status]}`}>
                          {loan.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

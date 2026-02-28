"use client"

import { PiggyBank, ShieldCheck, Layers3, ArrowDownToLine } from "lucide-react"
import { LoanStatus, type Loan } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { DepositsSkeleton } from "@/components/skeletons"

type DepositSummary = {
  totalCollateralLocked: number
  averageDeposit: number
  collateralCoverage: number
  todayDeposits: number
}

function computeDepositStats(loans: Loan[]): DepositSummary {
  const withCollateral = loans.filter((l) => l.collateralDeposited > 0)
  const totalCollateralLocked = withCollateral.reduce((sum, l) => sum + l.collateralDeposited, 0)
  const averageDeposit = withCollateral.length > 0 ? totalCollateralLocked / withCollateral.length : 0
  const totalRequired = withCollateral.reduce((sum, l) => sum + l.collateralRequired, 0)
  const collateralCoverage = totalRequired > 0 ? (totalCollateralLocked / totalRequired) * 100 : 0

  // "Today" — filter by start date being today
  const today = new Date().toDateString()
  const todayDeposits = loans.filter(
    (l) => l.status === LoanStatus.COLLATERAL_DEPOSITED && l.createdAt && new Date(l.createdAt).toDateString() === today,
  ).length

  return { totalCollateralLocked, averageDeposit, collateralCoverage, todayDeposits }
}

export default function Deposits() {
  const { data: loansData, loading, error, refresh } = useCachedFetch<{ loans: Loan[] }>("/api/v1/admin/loans")
  const loans = loansData?.loans ?? []

  const stats = computeDepositStats(loans)

  // Show loans that have collateral activity
  const depositQueue = loans.filter(
    (l) =>
      l.status === LoanStatus.PENDING_COLLATERAL ||
      l.status === LoanStatus.COLLATERAL_DEPOSITED ||
      (l.status === LoanStatus.ACTIVE && l.collateralDeposited > 0),
  )

  const statCards = [
    { label: "Total Locked", value: `${stats.totalCollateralLocked.toFixed(2)} ETH`, sublabel: "Across all active loans", icon: PiggyBank },
    { label: "Avg Deposit", value: `${stats.averageDeposit.toFixed(2)} ETH`, sublabel: "Per loan", icon: Layers3 },
    { label: "Coverage", value: `${stats.collateralCoverage.toFixed(0)}%`, sublabel: "Collateral vs. required", icon: ShieldCheck },
    { label: "Today's Deposits", value: String(stats.todayDeposits), sublabel: "New collateral today", icon: ArrowDownToLine },
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Deposits</h1>
          <p className="text-sm text-gray-500">Monitor collateral deposits on Ethereum.</p>
        </div>

        {loading && <DepositsSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl bg-orange-50 p-3">
                      <stat.icon size={18} className="text-orange-500" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.sublabel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900">Collateral Queue</h2>
                <p className="text-sm text-gray-500">Loans with pending or active collateral on Ethereum.</p>
              </div>

              <div className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
                  <span>Loan ID</span>
                  <span>Collateral</span>
                  <span>Chain</span>
                  <span>Status</span>
                </div>

                {depositQueue.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No collateral deposits found.</div>
                )}

                {depositQueue.map((loan) => (
                  <div
                    key={loan.id}
                    className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 font-mono text-xs">{loan.id.slice(0, 16)}...</p>
                      <p className="text-xs text-gray-500">User: {loan.userId.slice(0, 8)}...</p>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {loan.collateralDeposited} / {loan.collateralRequired} ETH
                    </div>
                    <div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                        Ethereum
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {loan.status === LoanStatus.PENDING_COLLATERAL && "Awaiting"}
                      {loan.status === LoanStatus.COLLATERAL_DEPOSITED && "Deposited"}
                      {loan.status === LoanStatus.ACTIVE && "Active"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

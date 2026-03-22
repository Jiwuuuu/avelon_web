"use client"

import { PiggyBank, ShieldCheck, Layers3, ArrowDownToLine, TrendingUp, Users } from "lucide-react"
import { LoanStatus, type Loan } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { DepositsSkeleton } from "@/components/skeletons"

// ── Borrower collateral stats ────────────────────────────────────────────────

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

  const today = new Date().toDateString()
  const todayDeposits = loans.filter(
    (l) => l.status === LoanStatus.COLLATERAL_DEPOSITED && l.createdAt && new Date(l.createdAt).toDateString() === today,
  ).length

  return { totalCollateralLocked, averageDeposit, collateralCoverage, todayDeposits }
}

// ── Investor deposit types ───────────────────────────────────────────────────

type InvestorDeposit = {
  id: string
  userId: string
  amount: number
  txHash: string
  status: "PENDING" | "CONFIRMED" | "WITHDRAWN"
  poolSharePercent: number | null
  createdAt: string
  withdrawnAt: string | null
  user: { email: string; name: string | null } | null
}

type InvestorDepositsResponse = {
  data: InvestorDeposit[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-emerald-50 text-emerald-800",
  WITHDRAWN: "bg-stone-100 text-stone-600",
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Deposits() {
  // Borrower collateral
  const { data: loansData, loading: loansLoading, error: loansError, refresh: loansRefresh } =
    useCachedFetch<{ loans: Loan[] }>("/api/v1/admin/loans")
  const loans = loansData?.loans ?? []
  const stats = computeDepositStats(loans)
  const depositQueue = loans.filter(
    (l) =>
      l.status === LoanStatus.PENDING_COLLATERAL ||
      l.status === LoanStatus.COLLATERAL_DEPOSITED ||
      (l.status === LoanStatus.ACTIVE && l.collateralDeposited > 0),
  )

  // Investor deposits
  const { data: investorData, loading: investorLoading, error: investorError, refresh: investorRefresh } =
    useCachedFetch<InvestorDepositsResponse>("/api/v1/admin/deposits?limit=50")
  const investorDeposits = investorData?.data ?? []
  const investorTotal = investorDeposits.filter((d) => d.status === "CONFIRMED").reduce((s, d) => s + d.amount, 0)
  const investorCount = new Set(investorDeposits.filter((d) => d.status === "CONFIRMED").map((d) => d.userId)).size

  const collateralStatCards = [
    { label: "Total Locked", value: `${stats.totalCollateralLocked.toFixed(2)} ETH`, sublabel: "Across all active loans", icon: PiggyBank },
    { label: "Avg Deposit", value: `${stats.averageDeposit.toFixed(2)} ETH`, sublabel: "Per loan", icon: Layers3 },
    { label: "Coverage", value: `${stats.collateralCoverage.toFixed(0)}%`, sublabel: "Collateral vs. required", icon: ShieldCheck },
    { label: "Today's Deposits", value: String(stats.todayDeposits), sublabel: "New collateral today", icon: ArrowDownToLine },
  ]

  const investorStatCards = [
    { label: "Pool TVL (investor)", value: `${investorTotal.toFixed(4)} ETH`, sublabel: "Confirmed deposits", icon: TrendingUp },
    { label: "Active investors", value: String(investorCount), sublabel: "Unique investors", icon: Users },
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-10">

        {/* ── Borrower collateral ── */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Collateral Deposits</h1>
            <p className="text-sm text-gray-500">Borrower collateral locked on Ethereum.</p>
          </div>

          {loansLoading && <DepositsSkeleton />}

          {loansError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-red-700 font-medium">{loansError}</p>
              <button onClick={loansRefresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
            </div>
          )}

          {!loansLoading && !loansError && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {collateralStatCards.map((stat) => (
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
        </section>

        {/* ── Investor pool deposits ── */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Investor Pool Deposits</h2>
            <p className="text-sm text-gray-500">Liquidity provided by investors to the lending pool.</p>
          </div>

          {investorLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
            </div>
          )}

          {investorError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-red-700 font-medium">{investorError}</p>
              <button onClick={investorRefresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
            </div>
          )}

          {!investorLoading && !investorError && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {investorStatCards.map((stat) => (
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
                <div className="hidden grid-cols-[2fr,1fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid mb-4">
                  <span>Investor</span>
                  <span>Amount</span>
                  <span>Pool share</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>

                {investorDeposits.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No investor deposits yet.</div>
                )}

                <div className="space-y-3">
                  {investorDeposits.map((d) => (
                    <div
                      key={d.id}
                      className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 hover:bg-white hover:shadow-md transition md:grid-cols-[2fr,1fr,1fr,1fr,1fr]"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{d.user?.email ?? d.userId.slice(0, 8)}</p>
                        {d.user?.name && <p className="text-xs text-gray-500">{d.user.name}</p>}
                      </div>
                      <div className="font-semibold font-mono text-gray-900 text-sm">{d.amount.toFixed(4)} ETH</div>
                      <div className="text-sm text-gray-600">
                        {d.poolSharePercent != null ? `${d.poolSharePercent.toFixed(2)}%` : "—"}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</div>
                      <div>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[d.status] ?? "bg-stone-100 text-stone-600"}`}>
                          {d.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  )
}

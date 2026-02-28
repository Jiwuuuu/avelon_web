"use client"

import { useMemo, useState } from "react"
import { ArrowDownToLine, ArrowUpToLine, Search } from "lucide-react"
import { LoanTransactionType, TransactionStatus, type LoanTransaction } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { TransactionSkeleton } from "@/components/skeletons"

const statusStyles: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "bg-amber-50 text-amber-700",
  [TransactionStatus.CONFIRMED]: "bg-emerald-50 text-emerald-700",
  [TransactionStatus.FAILED]: "bg-rose-50 text-rose-700",
}

const inflowTypes = new Set([
  LoanTransactionType.COLLATERAL_DEPOSIT,
  LoanTransactionType.COLLATERAL_TOPUP,
  LoanTransactionType.REPAYMENT,
  LoanTransactionType.FULL_REPAYMENT,
  LoanTransactionType.EXTENSION_FEE,
  LoanTransactionType.ORIGINATION_FEE,
  LoanTransactionType.LATE_FEE,
])

export default function Transaction() {
  const { data: txData, loading, error, refresh } = useCachedFetch<{ transactions: LoanTransaction[] }>("/api/v1/admin/loans")
  const transactions = txData?.transactions ?? []
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filtered = useMemo(() => {
    const normalized = searchTerm.toLowerCase()
    return transactions.filter((tx) => {
      const matchesSearch = tx.id.toLowerCase().includes(normalized) || (tx.transactionHash ?? "").toLowerCase().includes(normalized)
      const matchesType = typeFilter === "all" || tx.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [transactions, searchTerm, typeFilter])

  // Summary Stats
  const confirmed = transactions.filter((t) => t.status === TransactionStatus.CONFIRMED)
  const pending = transactions.filter((t) => t.status === TransactionStatus.PENDING)
  const totalVolume = confirmed.reduce((sum, t) => sum + t.amount, 0)

  const summaryCards = [
    { label: "Total Volume", value: `${totalVolume.toFixed(2)} ETH`, delta: `${confirmed.length} confirmed`, trend: "text-emerald-600" },
    { label: "Pending", value: `${pending.length} txns`, delta: "Awaiting confirmation", trend: "text-amber-600" },
    { label: "Total Transactions", value: String(transactions.length), delta: "All time", trend: "text-gray-500" },
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-sm text-gray-500">On-chain transactions across all loans on Ethereum.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or tx hash"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All Types</option>
              {Object.values(LoanTransactionType).map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-400">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{card.value}</p>
              <p className={`text-xs font-semibold ${card.trend} mt-2`}>{card.delta}</p>
            </div>
          ))}
        </div>

        {loading && <TransactionSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500 mb-6">All blockchain transactions across the platform.</p>

            <div className="space-y-4">
              <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
                <span>Transaction</span>
                <span>Amount</span>
                <span>Type</span>
                <span>Status</span>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-500">No transactions found.</div>
              )}

              {filtered.map((tx) => {
                const isInflow = inflowTypes.has(tx.type)
                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-sm text-gray-700 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {isInflow ? (
                          <ArrowDownToLine size={16} className="text-emerald-500" />
                        ) : (
                          <ArrowUpToLine size={16} className="text-rose-500" />
                        )}
                        {tx.description ?? tx.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tx.id.slice(0, 8)}...
                        {tx.transactionHash && ` • ${tx.transactionHash.slice(0, 12)}...`}
                      </p>
                    </div>
                    <div className="font-semibold text-gray-900">{isInflow ? "+" : "-"}{tx.amount} ETH</div>
                    <div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                        {tx.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[tx.status]}`}>{tx.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

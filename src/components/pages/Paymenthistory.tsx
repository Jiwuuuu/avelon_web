"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { LoanStatus, type Loan } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { TablePageSkeleton } from "@/components/skeletons"

// ── Badges ─────────────────────────────────────────────────
const statusStyles: Record<LoanStatus, string> = {
  [LoanStatus.PENDING_COLLATERAL]: "bg-yellow-100 text-yellow-700",
  [LoanStatus.COLLATERAL_DEPOSITED]: "bg-blue-100 text-blue-700",
  [LoanStatus.ACTIVE]: "bg-green-100 text-green-700",
  [LoanStatus.REPAID]: "bg-emerald-100 text-emerald-700",
  [LoanStatus.LIQUIDATED]: "bg-red-100 text-red-700",
  [LoanStatus.CANCELLED]: "bg-gray-100 text-gray-700",
  [LoanStatus.EXPIRED]: "bg-gray-200 text-gray-600",
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

export default function PaymentHistory() {
  const { data: loansData, loading, error, refresh } = useCachedFetch<{ loans: Loan[] }>("/api/v1/admin/loans")
  const loans = loansData?.loans ?? []
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | LoanStatus>("ALL")

  const filtered = useMemo(
    () =>
      loans.filter((loan) => {
        const matchesSearch =
          searchTerm === "" ||
          loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.userId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || loan.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [loans, searchTerm, statusFilter],
  )

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Loan History</h1>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 w-72">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by loan ID or user"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-0 text-sm outline-none w-full"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | LoanStatus)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(LoanStatus).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && <TablePageSkeleton columns={7} />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Loan ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Principal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Owed</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-xs font-mono text-gray-700">{loan.id.slice(0, 10)}...</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">{loan.principal} ETH</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{loan.interestRate}%</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{loan.duration} days</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{(loan.principalOwed + loan.interestOwed + loan.feesOwed).toFixed(4)} ETH</td>
                    <td className="px-4 py-4"><StatusBadge status={loan.status} /></td>
                    <td className="px-4 py-4 text-xs text-gray-500">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500 text-sm">No loans found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

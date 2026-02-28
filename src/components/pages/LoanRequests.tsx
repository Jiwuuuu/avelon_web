"use client"

import { useState, useMemo } from "react"
import { Search, Eye, X } from "lucide-react"
import { LoanStatus, type Loan } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { TablePageSkeleton } from "@/components/skeletons"

// ── StatusBadge ────────────────────────────────────────────
const statusStyles: Record<LoanStatus, string> = {
  [LoanStatus.PENDING_COLLATERAL]: "bg-yellow-100 text-yellow-800",
  [LoanStatus.COLLATERAL_DEPOSITED]: "bg-blue-100 text-blue-800",
  [LoanStatus.ACTIVE]: "bg-green-100 text-green-800",
  [LoanStatus.REPAID]: "bg-emerald-100 text-emerald-800",
  [LoanStatus.LIQUIDATED]: "bg-red-100 text-red-800",
  [LoanStatus.CANCELLED]: "bg-gray-100 text-gray-700",
  [LoanStatus.EXPIRED]: "bg-gray-200 text-gray-600",
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

// ── LoanDetailModal ────────────────────────────────────────
function LoanDetailModal({
  loan,
  isOpen,
  onClose,
}: {
  loan: Loan | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !loan) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Loan Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm text-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Loan Info</h3>
            <div className="flex justify-between"><span className="text-gray-500">Loan ID</span><span className="font-medium font-mono text-xs">{loan.id.slice(0, 12)}...</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Principal</span><span className="font-medium">{loan.principal} ETH</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Interest Rate</span><span className="font-medium">{loan.interestRate}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{loan.duration} days</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={loan.status} /></div>
            <div className="flex justify-between"><span className="text-gray-500">Origination Fee</span><span className="font-medium">{loan.originationFee}%</span></div>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Collateral &amp; Repayment</h3>
            <div className="flex justify-between"><span className="text-gray-500">Collateral Required</span><span className="font-medium">{loan.collateralRequired} ETH</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Collateral Deposited</span><span className="font-medium">{loan.collateralDeposited} ETH</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Principal Owed</span><span className="font-medium">{loan.principalOwed} ETH</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Interest Owed</span><span className="font-medium">{loan.interestOwed} ETH</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Credit Score (Snapshot)</span><span className="font-medium">{loan.creditScoreSnapshot}</span></div>
            {loan.startDate && <div className="flex justify-between"><span className="text-gray-500">Start Date</span><span className="font-medium">{new Date(loan.startDate).toLocaleDateString()}</span></div>}
            {loan.dueDate && <div className="flex justify-between"><span className="text-gray-500">Due Date</span><span className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</span></div>}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function LoanRequests() {
  const { data: loansData, loading, error, refresh } = useCachedFetch<{ loans: Loan[] }>("/api/v1/admin/loans")
  const loans = loansData?.loans ?? []
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all")
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return loans.filter((loan) => {
      const matchesSearch =
        searchTerm === "" ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.userId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || loan.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [loans, searchTerm, statusFilter])

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by ID or user"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | LoanStatus)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All Status</option>
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Principal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Collateral</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No loans found</td>
                  </tr>
                ) : (
                  filtered.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{loan.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{loan.principal} ETH</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{loan.duration} days</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{loan.interestRate}%</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{loan.collateralDeposited} / {loan.collateralRequired} ETH</td>
                      <td className="px-6 py-4"><StatusBadge status={loan.status} /></td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => { setSelectedLoan(loan); setIsModalOpen(true) }}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          View <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LoanDetailModal
        loan={selectedLoan}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedLoan(null) }}
      />
    </div>
  )
}

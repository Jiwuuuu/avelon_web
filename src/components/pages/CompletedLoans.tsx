"use client"

import { type Loan } from "@avelon_capstone/types"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { CompletedLoansSkeleton } from "@/components/skeletons"

export default function CompletedLoans() {
  const { data: loansData, loading, error, refresh } = useCachedFetch<{ loans: Loan[] }>("/api/v1/admin/loans?status=REPAID")
  const loans = loansData?.loans ?? []

  // Stats
  const totalReturned = loans.reduce((sum, l) => sum + l.principal, 0)
  const avgRate = loans.length > 0 ? loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length : 0
  const avgDuration = loans.length > 0 ? loans.reduce((sum, l) => sum + l.duration, 0) / loans.length : 0

  const highlights = [
    { label: "Capital Returned", value: `${totalReturned.toFixed(2)} ETH`, detail: `${loans.length} loans completed` },
    { label: "Avg Interest Rate", value: `${avgRate.toFixed(2)}%`, detail: "Blended across completed loans" },
    { label: "Avg Duration", value: `${avgDuration.toFixed(0)} days`, detail: "Average loan cycle" },
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Completed Loans</h1>
          <p className="text-sm text-gray-500">Fully repaid loans with realized returns.</p>
        </div>

        {loading && <CompletedLoansSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((h) => (
                <div key={h.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-400">{h.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{h.value}</p>
                  <p className="text-xs text-gray-500">{h.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recently Completed</h2>
                  <p className="text-sm text-gray-500">Capital returned and available for redeployment.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
                  <span>Loan ID</span>
                  <span>Principal</span>
                  <span>Interest Rate</span>
                  <span>Repaid Date</span>
                </div>

                {loans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No completed loans found.</div>
                )}

                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 font-mono text-xs">{loan.id.slice(0, 16)}...</p>
                      <p className="text-xs text-gray-500">{loan.duration} day term</p>
                    </div>
                    <div className="font-semibold text-gray-900">{loan.principal} ETH</div>
                    <div className="font-semibold text-gray-900">{loan.interestRate}%</div>
                    <div className="font-medium text-gray-700">
                      {loan.repaidAt ? new Date(loan.repaidAt).toLocaleDateString() : "—"}
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

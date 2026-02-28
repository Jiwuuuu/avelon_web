import { Skeleton, SkeletonStatRow, SkeletonTable, SkeletonCardList, SkeletonPlanGrid, SkeletonBanner } from "@/components/ui/skeleton"

/* ═══════════════════════════════════════════════════════════
   Dashboard  — 4 stat cards + 2-col bottom row
   ═══════════════════════════════════════════════════════════ */
export function DashboardSkeleton() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-44" />

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-2 w-2 rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Users  — search bar + table (6 cols) + pagination
   ═══════════════════════════════════════════════════════════ */
export function UsersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search / filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <SkeletonTable columns={6} rows={8} />
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Loan Requests / Payment History  — search + filter + table
   ═══════════════════════════════════════════════════════════ */
export function TablePageSkeleton({ columns = 7 }: { columns?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <SkeletonTable columns={columns} rows={6} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Loan Plans  — search/sort + card grid
   ═══════════════════════════════════════════════════════════ */
export function LoanPlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <SkeletonPlanGrid count={6} />
      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Loan Status  — 4 summary cards + pipeline card-list
   ═══════════════════════════════════════════════════════════ */
export function LoanStatusSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonStatRow count={4} />
      <SkeletonCardList rows={4} cols="md:grid-cols-[1.5fr,1fr,1fr,1fr,1fr]" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Deposits  — 4 stat cards + collateral queue
   ═══════════════════════════════════════════════════════════ */
export function DepositsSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonStatRow count={4} />
      <SkeletonCardList rows={4} cols="md:grid-cols-[2fr,1fr,1fr,1fr]" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Transactions  — 3 summary cards + activity card-list
   ═══════════════════════════════════════════════════════════ */
export function TransactionSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonStatRow count={3} cols="sm:grid-cols-3" />
      <SkeletonCardList rows={5} cols="md:grid-cols-[2fr,1fr,1fr,1fr]" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Completed Loans  — 3 highlight cards + list
   ═══════════════════════════════════════════════════════════ */
export function CompletedLoansSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonStatRow count={3} cols="md:grid-cols-3" />
      <SkeletonCardList rows={4} cols="md:grid-cols-[2fr,1fr,1fr,1fr]" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Wallet  — banner + 3 stat cards + price history
   ═══════════════════════════════════════════════════════════ */
export function WalletSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonBanner />
      <SkeletonStatRow count={3} cols="lg:grid-cols-3" />
      {/* Price history */}
      <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3 w-64" />
        <div className="space-y-3 mt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

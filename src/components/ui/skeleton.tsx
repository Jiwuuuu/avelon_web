/**
 * Skeleton loading primitives.
 *
 * Usage:
 *   <Skeleton className="h-8 w-32" />            — generic block
 *   <Skeleton className="h-4 w-full rounded" />   — text line
 *   <Skeleton className="h-10 w-10 rounded-full" /> — avatar
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

/* ── Reusable compositions ──────────────────────────────── */

/** Single stat-card skeleton (icon + label + value). */
export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    </div>
  )
}

/** Row of stat cards. */
export function SkeletonStatRow({ count = 4, cols = "sm:grid-cols-2 xl:grid-cols-4" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  )
}

/** Single table row skeleton with N cells. */
function SkeletonTableRow({ cells }: { cells: number }) {
  return (
    <tr>
      {Array.from({ length: cells }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={`h-4 ${i === 0 ? "w-24" : "w-16"}`} />
        </td>
      ))}
    </tr>
  )
}

/** Full table skeleton with header + rows. */
export function SkeletonTable({ columns = 6, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cells={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Card‑list skeleton (e.g. pipeline, collateral queue). */
export function SkeletonCardList({ rows = 4, cols = "md:grid-cols-[1.5fr,1fr,1fr,1fr,1fr]" }: { rows?: number; cols?: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 ${cols}`}
          >
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Grid of plan‑style cards. */
export function SkeletonPlanGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Large gradient banner skeleton (Wallet treasury). */
export function SkeletonBanner() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 shadow-lg">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 bg-white/10" />
        <Skeleton className="h-10 w-40 bg-white/10" />
        <Skeleton className="h-4 w-56 bg-white/10" />
      </div>
    </div>
  )
}

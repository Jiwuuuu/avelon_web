import { X, Trash2 } from "lucide-react"
import { type LoanPlan, InterestType } from "@/types"
import { getTier } from "@/lib/loan-plans"

interface PlanDetailModalProps {
  plan: LoanPlan
  onClose: () => void
  onDeactivate: (planId: string) => void
  onDelete: (planId: string) => void
}

export function PlanDetailModal({ plan, onClose, onDeactivate, onDelete }: PlanDetailModalProps) {
  const tier = getTier(plan.maxAmount)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto overflow-hidden">
        {/* Accent bar */}
        <div className={`h-2 ${tier.accent}`} />

        <div className="p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${tier.bg} ${tier.color} ${tier.border}`}>
                  {tier.label}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${plan.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description ?? "No description"}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900">
              <X size={16} />
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DetailStat label="Amount Range (ETH)" value={`${plan.minAmount} — ${plan.maxAmount}`} large />
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400 font-medium">Duration Options (days)</p>
              <div className="mt-1 flex gap-1.5 flex-wrap">
                {plan.durationOptions.map((d) => (
                  <span key={d} className="rounded-lg bg-white border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-900">{d}d</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400 font-medium">APR</p>
              <p className="text-2xl font-bold text-gray-900">{plan.interestRate}%</p>
              <span className="mt-1 inline-block rounded-md bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                {plan.interestType === InterestType.COMPOUND ? "Compound" : "Flat"}
              </span>
            </div>
            <DetailStat label="Collateral Ratio" value={`${plan.collateralRatio}%`} large />
            <DetailStat label="Min Credit Score" value={String(plan.minCreditScore)} large />
            <DetailStat label="Origination Fee" value={`${plan.originationFee}%`} large />
            <DetailStat label="Grace Period" value={`${plan.gracePeriodDays} days`} large />
            <DetailStat
              label="Created"
              value={new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="text-sm font-medium text-gray-600 hover:text-gray-900">Close</button>
            {plan.isActive ? (
              <button
                type="button"
                onClick={() => onDeactivate(plan.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} /> Deactivate Plan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onDelete(plan.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} /> Delete Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Small helper for repeated stat blocks ────────────────── */
function DetailStat({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs uppercase text-gray-400 font-medium">{label}</p>
      <p className={`font-bold text-gray-900 ${large ? "text-2xl" : "text-lg font-semibold"}`}>{value}</p>
    </div>
  )
}

import { Clock, Eye, Trash2 } from "lucide-react"
import { type LoanPlan, InterestType } from "@/types"
import { getTier } from "@/lib/loan-plans"

interface PlanCardProps {
  plan: LoanPlan
  onView: (plan: LoanPlan) => void
  onDeactivate: (planId: string) => void
  onDelete: (planId: string) => void
}

export function PlanCard({ plan, onView, onDeactivate, onDelete }: PlanCardProps) {
  const tier = getTier(plan.maxAmount)

  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg overflow-hidden">
      {/* Color accent bar */}
      <div className={`h-1.5 ${tier.accent}`} />

      <div className="p-5">
        {/* Top: name, tier, status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-gray-900 truncate">{plan.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{plan.description ?? "No description"}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tier.bg} ${tier.color} ${tier.border} border`}>
              {tier.label}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${plan.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
              {plan.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Amount Range */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Amount Range (ETH)</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{plan.minAmount} — {plan.maxAmount}</p>
        </div>

        {/* Stats grid */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-[10px] uppercase text-gray-400 font-medium">APR</p>
            <p className="text-sm font-bold text-gray-900">{plan.interestRate}%</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Collateral</p>
            <p className="text-sm font-bold text-gray-900">{plan.collateralRatio}%</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-[10px] uppercase text-gray-400 font-medium">Type</p>
            <p className="text-sm font-bold text-gray-900">{plan.interestType === InterestType.COMPOUND ? "Compound" : "Flat"}</p>
          </div>
        </div>

        {/* Durations */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <Clock size={12} className="text-gray-400" />
          {plan.durationOptions.map((d) => (
            <span key={d} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{d}d</span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => onView(plan)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <Eye size={15} /> View Details
          </button>
          <div className="flex items-center gap-2">
            {plan.isActive ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDeactivate(plan.id) }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition"
              >
                <Trash2 size={15} /> Deactivate
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(plan.id) }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

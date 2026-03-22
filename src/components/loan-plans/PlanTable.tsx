import { Eye, Trash2 } from "lucide-react"
import { type LoanPlan, InterestType } from "@/types"
import { getTier } from "@/lib/loan-plans"

interface PlanTableProps {
  plans: LoanPlan[]
  onView: (plan: LoanPlan) => void
  onDeactivate: (planId: string) => void
  onDelete: (planId: string) => void
}

export function PlanTable({ plans, onView, onDeactivate, onDelete }: PlanTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
            <th className="px-5 py-3 font-medium">Plan</th>
            <th className="px-5 py-3 font-medium">Tier</th>
            <th className="px-5 py-3 font-medium">Amount (ETH)</th>
            <th className="px-5 py-3 font-medium">APR</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Collateral</th>
            <th className="px-5 py-3 font-medium">Durations</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const tier = getTier(plan.maxAmount)
            return (
              <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{plan.description ?? "—"}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tier.bg} ${tier.color} border ${tier.border}`}>{tier.label}</span>
                </td>
                <td className="px-5 py-3 font-medium text-gray-900">{plan.minAmount} — {plan.maxAmount}</td>
                <td className="px-5 py-3 font-medium text-gray-900">{plan.interestRate}%</td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {plan.interestType === InterestType.COMPOUND ? "Compound" : "Flat"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">{plan.collateralRatio}%</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {plan.durationOptions.map((d) => (
                      <span key={d} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">{d}d</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${plan.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onView(plan)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
                      <Eye size={16} />
                    </button>
                    {plan.isActive ? (
                      <button type="button" onClick={() => onDeactivate(plan.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button type="button" onClick={() => onDelete(plan.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

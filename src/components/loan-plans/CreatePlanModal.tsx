import { useState } from "react"
import type { FormEvent } from "react"
import { X, Loader2, PlusCircle } from "lucide-react"
import { type LoanPlan, type CreateLoanPlanInput, InterestType } from "@/types"
import { api } from "@/lib/api"

interface CreatePlanModalProps {
  onClose: () => void
  onSuccess: (planName: string) => void
  onError: (message: string) => void
  invalidate: () => void
  refresh: () => Promise<void>
}

export function CreatePlanModal({ onClose, onSuccess, onError, invalidate, refresh }: CreatePlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const form = event.currentTarget
    const data = new FormData(form)

    const input: CreateLoanPlanInput = {
      name: data.get("name") as string,
      description: (data.get("description") as string) || undefined,
      minCreditScore: Number(data.get("minCreditScore")) || 0,
      minAmount: Number(data.get("minAmount")) || 0,
      maxAmount: Number(data.get("maxAmount")) || 0,
      durationOptions: (data.get("durationOptions") as string).split(",").map((d) => Number(d.trim())).filter(Boolean),
      interestRate: Number(data.get("interestRate")) || 0,
      interestType: (data.get("interestType") as InterestType) || InterestType.FLAT,
      collateralRatio: Number(data.get("collateralRatio")) || 150,
      originationFee: Number(data.get("originationFee")) || 0,
      gracePeriodDays: Number(data.get("gracePeriodDays")) || 0,
    }

    try {
      const result = await api.post<LoanPlan>("/api/v1/admin/plans", input)
      if (result.success) {
        invalidate()
        await refresh()
        onClose()
        form.reset()
        onSuccess(`"${input.name}" created successfully.`)
      }
    } catch {
      onError("Failed to create plan. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create New Loan Plan</h2>
            <p className="text-sm text-gray-500">Configure the plan terms before publishing.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormRow>
            <FormField name="name" label="Plan Name *" type="text" required placeholder="e.g. Growth Accelerator" />
            <FormField name="minCreditScore" label="Min Credit Score *" type="number" required min={0} max={100} placeholder="50" />
          </FormRow>

          <FormRow>
            <FormField name="minAmount" label="Min Amount (ETH) *" type="number" required min={0} step={0.01} placeholder="0.1" />
            <FormField name="maxAmount" label="Max Amount (ETH) *" type="number" required min={0} step={0.01} placeholder="10" />
          </FormRow>

          <FormRow>
            <FormField name="durationOptions" label="Duration Options (days, comma-sep) *" type="text" required placeholder="30, 60, 90" />
            <FormField name="interestRate" label="Interest Rate (%) *" type="number" required min={0} step={0.1} placeholder="5.0" />
          </FormRow>

          <FormRow>
            <FormField name="collateralRatio" label="Collateral Ratio (%) *" type="number" required min={100} placeholder="150" />
            <FormField name="originationFee" label="Origination Fee (%) *" type="number" required min={0} step={0.1} placeholder="1.0" />
          </FormRow>

          <FormRow>
            <label className="text-sm font-medium text-gray-700">
              Interest Type
              <select name="interestType" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" defaultValue={InterestType.FLAT}>
                <option value={InterestType.FLAT}>Flat</option>
                <option value={InterestType.COMPOUND}>Compound</option>
              </select>
            </label>
            <FormField name="gracePeriodDays" label="Grace Period (days)" type="number" min={0} placeholder="7" />
          </FormRow>

          <label className="text-sm font-medium text-gray-700">
            Description
            <textarea name="description" rows={2} placeholder="Brief description of this plan." className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
          </label>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Small form helpers ───────────────────────────────────── */
function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function FormField({
  name, label, type, required, placeholder, min, max, step,
}: {
  name: string; label: string; type: string; required?: boolean; placeholder?: string; min?: number; max?: number; step?: number
}) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
    </label>
  )
}

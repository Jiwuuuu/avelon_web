import { useState } from "react"
import type { FormEvent } from "react"
import { X, Loader2, PlusCircle, Save } from "lucide-react"
import { type LoanPlan, type CreateLoanPlanInput, InterestType } from "@/types"
import { api } from "@/lib/api"
import { errorMessage } from "@/lib/api-errors"

interface CreatePlanModalProps {
  // Editing an existing plan when set; creating a new one otherwise
  plan?: LoanPlan
  onClose: () => void
  onSuccess: (planName: string) => void
  onError: (message: string) => void
  invalidate: () => void
  refresh: () => Promise<void>
}

export function CreatePlanModal({ plan, onClose, onSuccess, onError, invalidate, refresh }: CreatePlanModalProps) {
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
      interestType: InterestType.FLAT,
      collateralRatio: Number(data.get("collateralRatio")) || 35,
      originationFee: Number(data.get("originationFee")) || 0,
      gracePeriodDays: Number(data.get("gracePeriodDays")) || 0,
    }

    if (input.minAmount <= 0 || input.maxAmount <= 0 || input.minAmount > input.maxAmount) {
      onError("Enter a valid amount range; minimum cannot exceed maximum.")
      setIsSubmitting(false)
      return
    }
    if (!input.durationOptions.length || new Set(input.durationOptions).size !== input.durationOptions.length) {
      onError("Enter at least one unique duration in days.")
      setIsSubmitting(false)
      return
    }

    try {
      const result = plan
        ? await api.put<LoanPlan>(`/api/v1/admin/plans/${plan.id}`, input)
        : await api.post<LoanPlan>("/api/v1/admin/plans", input)
      if (result.success) {
        invalidate()
        await refresh()
        onClose()
        form.reset()
        onSuccess(`"${input.name}" ${plan ? "updated" : "created"} successfully.`)
      } else {
        onError(errorMessage(result, "The backend rejected this plan configuration."))
      }
    } catch {
      onError(`Failed to ${plan ? "update" : "create"} plan. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{plan ? "Edit Loan Plan" : "Create New Loan Plan"}</h2>
            <p className="text-sm text-gray-500">{plan ? "Changes apply to new applications only." : "Configure the plan terms before publishing."}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormRow>
            <FormField name="name" label="Plan Name *" type="text" required placeholder="e.g. Growth Accelerator" defaultValue={plan?.name} />
            <FormField name="minCreditScore" label="Min Credit Score *" type="number" required min={0} max={100} placeholder="50" defaultValue={plan?.minCreditScore} />
          </FormRow>

          <FormRow>
            <FormField name="minAmount" label="Min Amount (ETH) *" type="number" required min={0.000001} step={0.000001} placeholder="0.1" defaultValue={plan?.minAmount} />
            <FormField name="maxAmount" label="Max Amount (ETH) *" type="number" required min={0.000001} step={0.000001} placeholder="10" defaultValue={plan?.maxAmount} />
          </FormRow>

          <FormRow>
            <FormField name="durationOptions" label="Duration Options (days, comma-sep) *" type="text" required placeholder="30, 60, 90" defaultValue={plan?.durationOptions.join(", ")} />
            <FormField name="interestRate" label="Annual Interest Rate (%) *" type="number" required min={0.1} max={100} step={0.1} placeholder="5.0" defaultValue={plan?.interestRate} />
          </FormRow>

          <FormRow>
            <FormField name="collateralRatio" label="Borrower Stake Ratio (%) *" type="number" required min={35} max={200} placeholder="35" defaultValue={plan?.collateralRatio} />
            <FormField name="originationFee" label="Origination Fee (%) *" type="number" required min={0} max={100} step={0.1} placeholder="1.0" defaultValue={plan?.originationFee} />
          </FormRow>

          <FormRow>
            <label className="text-sm font-medium text-gray-700">
              Interest Type
              <input value="Flat (annual, prorated by term)" readOnly className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600" />
            </label>
            <FormField name="gracePeriodDays" label="Grace Period (days)" type="number" min={0} placeholder="7" defaultValue={plan?.gracePeriodDays} />
          </FormRow>

          <label className="text-sm font-medium text-gray-700">
            Description
            <textarea name="description" rows={2} defaultValue={plan?.description ?? ""} placeholder="Brief description of this plan." className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
          </label>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : plan ? <Save size={18} /> : <PlusCircle size={18} />}
              {plan ? "Save Changes" : "Create Plan"}
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
  name, label, type, required, placeholder, min, max, step, defaultValue,
}: {
  name: string; label: string; type: string; required?: boolean; placeholder?: string; min?: number; max?: number; step?: number; defaultValue?: string | number
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
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
    </label>
  )
}

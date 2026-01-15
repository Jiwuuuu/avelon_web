import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, PlusCircle, Trash2, X } from "lucide-react"
import adminProfile from "../../assets/will.png"

type LoanPlan = {
  id: string
  name: string
  amountEth: number
  paymentDuration: string
  status: "Active" | "Draft" | "Archived"
  interestRate: number
  description: string
}

const sampleLoanPlans: LoanPlan[] = [
  {
    id: "plan-1",
    name: "Growth Accelerator",
    amountEth: 12,
    paymentDuration: "12 months",
    status: "Active",
    interestRate: 6.2,
    description: "Ideal for SMEs scaling operations with predictable revenue over the next year.",
  },
  {
    id: "plan-2",
    name: "Startup Sprint",
    amountEth: 5,
    paymentDuration: "6 months",
    status: "Draft",
    interestRate: 5.4,
    description: "Short-term infusion to bridge product launches or marketing pushes.",
  },
  {
    id: "plan-3",
    name: "Founders Reserve",
    amountEth: 20,
    paymentDuration: "24 months",
    status: "Active",
    interestRate: 7.5,
    description: "Extended runway for teams reinvesting in R&D and infrastructure.",
  },
  {
    id: "plan-4",
    name: "Bridge Infinity",
    amountEth: 8,
    paymentDuration: "9 months",
    status: "Archived",
    interestRate: 4.8,
    description: "Legacy program used for clients transitioning to the prime suite.",
  },
  {
    id: "plan-5",
    name: "Prime Builder",
    amountEth: 15,
    paymentDuration: "18 months",
    status: "Active",
    interestRate: 6.9,
    description: "Balanced approach for consistent yield with manageable monthly payouts.",
  },
  {
    id: "plan-6",
    name: "Micro Momentum",
    amountEth: 2.5,
    paymentDuration: "3 months",
    status: "Draft",
    interestRate: 4.2,
    description: "Test plan for onboarding new regions with mobile-first borrowers.",
  },
  {
    id: "plan-7",
    name: "Treasure Vault",
    amountEth: 25,
    paymentDuration: "30 months",
    status: "Active",
    interestRate: 8.1,
    description: "Premium tier backed by multi-sig collateral and audited cash flows.",
  },
]

const ITEMS_PER_PAGE = 6

export default function LoanPlans() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null)

  const totalPages = Math.ceil(sampleLoanPlans.length / ITEMS_PER_PAGE)

  const visiblePlans = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sampleLoanPlans.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage])

  const handleCardClick = (plan: LoanPlan) => setSelectedPlan(plan)
  const closePlanModal = () => setSelectedPlan(null)

  const handleCreatePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAddModalOpen(false)
  }

  const statusClasses: Record<LoanPlan["status"], string> = {
    Active: "bg-green-50 text-green-700",
    Draft: "bg-amber-50 text-amber-700",
    Archived: "bg-gray-100 text-gray-600",
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          <img src={adminProfile} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Plans</h1>
            <p className="text-sm text-gray-500">Curated credit products tailored for web3-native businesses.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
          >
            <PlusCircle size={18} /> Add Loan Plan
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visiblePlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleCardClick(plan)}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-500">#{plan.id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[plan.status]}`}>
                  {plan.status}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase text-gray-400">Amount (ETH)</p>
                  <p className="text-2xl font-semibold text-gray-900">{plan.amountEth.toFixed(1)}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    <p className="text-xs uppercase text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900">{plan.paymentDuration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-gray-400">APR</p>
                    <p className="font-medium text-gray-900">{plan.interestRate}%</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <span>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, sampleLoanPlans.length)} of {sampleLoanPlans.length} plans
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1
              const isActive = page === currentPage
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Create New Loan Plan</h2>
                <p className="text-sm text-gray-500">Pre-fill the contract terms before publishing to the marketplace.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Plan Name
                  <input
                    type="text"
                    placeholder="Enter plan name"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Payment Duration
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    defaultValue="12 months"
                  >
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>9 months</option>
                    <option>12 months</option>
                    <option>18 months</option>
                    <option>24 months</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Amount (ETH)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Status
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    defaultValue="Draft"
                  >
                    <option>Draft</option>
                    <option>Active</option>
                    <option>Archived</option>
                  </select>
                </label>
              </div>

              <label className="text-sm font-medium text-gray-700">
                Notes
                <textarea
                  rows={3}
                  placeholder="Add clarity on collateral, risk tags, or internal context."
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600"
                >
                  <PlusCircle size={18} /> Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Loan Plan</p>
                <h3 className="text-3xl font-semibold text-gray-900">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-500">{selectedPlan.description}</p>
              </div>
              <button
                type="button"
                onClick={closePlanModal}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Amount (ETH)</p>
                <p className="text-3xl font-semibold text-gray-900">{selectedPlan.amountEth.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Duration</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.paymentDuration}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">APR</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.interestRate}%</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">Status</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedPlan.status}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={closePlanModal}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} /> Delete plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

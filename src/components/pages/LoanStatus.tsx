import { ShieldCheck, TrendingUp, Activity, Clock } from "lucide-react"
import adminProfile from "../../assets/will.png"

type LoanStatusRecord = {
  borrower: string
  plan: string
  stage: "Performing" | "Grace" | "Delinquent"
  amount: string
  nextDue: string
  health: string
}

const portfolioSnapshot = [
  { label: "Performing", value: "87%", icon: ShieldCheck, accent: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Grace Window", value: "9 loans", icon: Clock, accent: "text-amber-500", bg: "bg-amber-50" },
  { label: "Delinquent", value: "3 loans", icon: Activity, accent: "text-rose-500", bg: "bg-rose-50" },
  { label: "Portfolio APR", value: "6.78%", icon: TrendingUp, accent: "text-indigo-600", bg: "bg-indigo-50" },
]

const loanStatusData: LoanStatusRecord[] = [
  { borrower: "Lumen Pay", plan: "Growth Accelerator", stage: "Performing", amount: "$450K", nextDue: "Jan 28", health: "Low risk" },
  { borrower: "Orbital Mining", plan: "Treasure Vault", stage: "Performing", amount: "$1.2M", nextDue: "Jan 22", health: "Healthy" },
  { borrower: "Atlas Mobility", plan: "Bridge Infinity", stage: "Grace", amount: "$180K", nextDue: "Jan 17", health: "Monitor" },
  { borrower: "Prime Stack", plan: "Prime Builder", stage: "Performing", amount: "$320K", nextDue: "Jan 30", health: "Healthy" },
  { borrower: "Nova Labs", plan: "Startup Sprint", stage: "Grace", amount: "$96K", nextDue: "Jan 19", health: "Call scheduled" },
  { borrower: "Carbon Collective", plan: "Founders Reserve", stage: "Delinquent", amount: "$640K", nextDue: "Dec 30", health: "Action needed" },
]

const timelineEvents = [
  { title: "Escrow top-up confirmed", detail: "Prime Builder • +12 ETH collateral", time: "11:24 AM" },
  { title: "Grace reminder issued", detail: "Startup Sprint • 96K outstanding", time: "09:05 AM" },
  { title: "Workout call booked", detail: "Carbon Collective • Thursday 2 PM", time: "Yesterday" },
]

const stageBadgeClasses: Record<LoanStatusRecord["stage"], string> = {
  Performing: "bg-emerald-50 text-emerald-700",
  Grace: "bg-amber-50 text-amber-700",
  Delinquent: "bg-rose-50 text-rose-700",
}

export default function LoanStatus() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          <img src={adminProfile.src} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Loan Status</h1>
          <p className="text-sm text-gray-500">Track repayment health, risk stages, and the interventions owning teams have taken.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {portfolioSnapshot.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`rounded-2xl ${item.bg} p-3`}>
                  <item.icon size={18} className={item.accent} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">Portfolio pipeline</h2>
              <p className="text-sm text-gray-500">Auto-prioritized by AI risk scoring.</p>
            </div>

            <div className="mt-6 space-y-4 text-sm text-gray-700">
              <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
                <span>Borrower</span>
                <span>Plan</span>
                <span>Next due</span>
                <span>Stage</span>
              </div>
              {loanStatusData.map((loan) => (
                <div
                  key={loan.borrower}
                  className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{loan.borrower}</p>
                    <p className="text-xs text-gray-500">Exposure {loan.amount}</p>
                  </div>
                  <div className="text-gray-700">{loan.plan}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{loan.nextDue}</p>
                    <p className="text-xs text-gray-500">{loan.health}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageBadgeClasses[loan.stage]}`}>
                      {loan.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Active interventions</h2>
            <p className="text-sm text-gray-500">Alerts synced from playbooks and collections teams.</p>
            <div className="mt-6 space-y-5">
              {timelineEvents.map((event) => (
                <div key={event.title} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-xs uppercase text-gray-400">{event.time}</p>
                  <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

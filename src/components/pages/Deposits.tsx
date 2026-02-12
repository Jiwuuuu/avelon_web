import { PiggyBank, ShieldCheck, Layers3, ArrowDownToLine } from "lucide-react"
import adminProfile from "../../assets/will.png"

type DepositRecord = {
  id: string
  contributor: string
  amount: string
  chain: string
  method: string
  eta: string
}

const depositQueue: DepositRecord[] = [
  { id: "DEP-5123", contributor: "Delta Ventures", amount: "$220,000", chain: "Ethereum", method: "Multi-sig", eta: "Cleared" },
  { id: "DEP-5122", contributor: "Solstice Fund", amount: "$48,500", chain: "Polygon", method: "Smart contract", eta: "2 mins" },
  { id: "DEP-5121", contributor: "Tidepool DAO", amount: "$15,200", chain: "Solana", method: "Programmatic", eta: "Batching" },
  { id: "DEP-5120", contributor: "Aurora Capital", amount: "$580,000", chain: "Ethereum", method: "Custody wire", eta: "Awaiting" },
]

const depositStats = [
  { label: "Total locked", value: "$18.4M", sublabel: "+$640K vs last week", icon: PiggyBank },
  { label: "Average ticket", value: "$72.6K", sublabel: "+4.1% variance", icon: Layers3 },
  { label: "Coverage", value: "124%",
    sublabel: "Insurance + safeguards", icon: ShieldCheck },
  { label: "Today's inflow", value: "$1.2M", sublabel: "13 deposits", icon: ArrowDownToLine },
]

export default function Deposits() {
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
          <h1 className="text-3xl font-bold text-gray-900">Deposits</h1>
          <p className="text-sm text-gray-500">Monitor treasury inflows by chain, custody tier, and automated policy coverage.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {depositStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-orange-50 p-3">
                  <stat.icon size={18} className="text-orange-500" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.sublabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">Incoming queue</h2>
            <p className="text-sm text-gray-500">Deposits awaiting confirmation or batching across rails.</p>
          </div>

          <div className="mt-6 space-y-4 text-sm text-gray-600">
            <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
              <span>Contributor</span>
              <span>Amount</span>
              <span>Route</span>
              <span>Status</span>
            </div>
            {depositQueue.map((deposit) => (
              <div
                key={deposit.id}
                className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
              >
                <div>
                  <p className="font-semibold text-gray-900">{deposit.contributor}</p>
                  <p className="text-xs text-gray-500">{deposit.id}</p>
                </div>
                <div className="font-semibold text-gray-900">{deposit.amount}</div>
                <div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    {deposit.chain}
                  </span>
                  <p className="text-xs text-gray-500">{deposit.method}</p>
                </div>
                <div className="text-sm font-medium text-gray-700">{deposit.eta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

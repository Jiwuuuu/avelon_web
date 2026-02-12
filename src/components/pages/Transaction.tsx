import { useMemo, useState } from "react"
import { ArrowDownToLine, ArrowUpToLine, Filter, Search } from "lucide-react"
import adminProfile from "../../assets/will.png"

type TransactionRecord = {
  id: string
  counterparty: string
  amount: string
  direction: "Inflow" | "Outflow"
  status: "Settled" | "Pending" | "Flagged"
  channel: "DeFi" | "Fiat" | "Node"
  timestamp: string
}

const mockTransactions: TransactionRecord[] = [
  { id: "TRX-9821", counterparty: "Bridgesters Custody", amount: "+$65,000", direction: "Inflow", status: "Settled", channel: "DeFi", timestamp: "02:42 PM · Today" },
  { id: "TRX-9820", counterparty: "Momentum Trading Desk", amount: "-$12,400", direction: "Outflow", status: "Settled", channel: "Fiat", timestamp: "01:18 PM · Today" },
  { id: "TRX-9819", counterparty: "Lumen Collective", amount: "+$4,900", direction: "Inflow", status: "Pending", channel: "Node", timestamp: "11:04 AM · Today" },
  { id: "TRX-9818", counterparty: "Nexus Yield", amount: "-$28,760", direction: "Outflow", status: "Flagged", channel: "DeFi", timestamp: "09:33 AM · Today" },
  { id: "TRX-9817", counterparty: "Polybank Asia", amount: "+$120,400", direction: "Inflow", status: "Settled", channel: "Fiat", timestamp: "07:10 AM · Today" },
  { id: "TRX-9816", counterparty: "Alpine Borrowers", amount: "-$8,240", direction: "Outflow", status: "Pending", channel: "Node", timestamp: "Yesterday" },
]

const statusClasses: Record<TransactionRecord["status"], string> = {
  Settled: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Flagged: "bg-rose-50 text-rose-700",
}

const summaryCards = [
  { label: "Net Volume", value: "$242.8K", delta: "+8.2%", trend: "text-emerald-600" },
  { label: "Avg Ticket", value: "$32.4K", delta: "-1.4%", trend: "text-rose-500" },
  { label: "Pending", value: "12 wires", delta: "2 flagged", trend: "text-amber-600" },
  { label: "Cleared Today", value: "$108K", delta: "+$12K vs yesterday", trend: "text-gray-500" },
]

export default function Transaction() {
  const [searchTerm, setSearchTerm] = useState("")
  const [channelFilter, setChannelFilter] = useState("all")

  const filteredTransactions = useMemo(() => {
    const normalized = searchTerm.toLowerCase()
    return mockTransactions.filter((record) => {
      const matchesSearch = record.counterparty.toLowerCase().includes(normalized) || record.id.toLowerCase().includes(normalized)
      const matchesChannel = channelFilter === "all" || record.channel === channelFilter
      return matchesSearch && matchesChannel
    })
  }, [channelFilter, searchTerm])

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          <img src={adminProfile.src} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-sm text-gray-500">Live settlement feed across fiat rails, node payouts, and DeFi liquidity.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400" />
              <input
                type="text"
                placeholder="Search reference ID"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All channels</option>
              <option value="DeFi">DeFi rails</option>
              <option value="Fiat">Fiat rails</option>
              <option value="Node">Validator payouts</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-400">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{card.value}</p>
              <p className={`text-xs font-semibold ${card.trend} mt-2`}>{card.delta}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
              <p className="text-sm text-gray-500">Auto-synced from settlement nodes every 30 seconds.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300"
            >
              <Filter size={16} /> Export CSV
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
              <span>Counterparty</span>
              <span>Amount</span>
              <span>Channel</span>
              <span>Status</span>
            </div>
            {filteredTransactions.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-sm text-gray-700 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
              >
                <div>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    {record.direction === "Inflow" ? (
                      <ArrowDownToLine size={16} className="text-emerald-500" />
                    ) : (
                      <ArrowUpToLine size={16} className="text-rose-500" />
                    )}
                    {record.counterparty}
                  </p>
                  <p className="text-xs text-gray-500">{record.id} • {record.timestamp}</p>
                </div>
                <div className="font-semibold text-gray-900">{record.amount}</div>
                <div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    {record.channel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[record.status]}`}>{record.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import adminProfile from "../../assets/will.png"

const closedDeals = [
  { id: "CL-903", borrower: "Helios Trading", plan: "Prime Builder", volume: "$420K", term: "12 months", yield: "6.1%", paidOn: "Jan 12" },
  { id: "CL-902", borrower: "Northwind Supply", plan: "Growth Accelerator", volume: "$260K", term: "9 months", yield: "5.4%", paidOn: "Jan 05" },
  { id: "CL-901", borrower: "Orbit Labs", plan: "Startup Sprint", volume: "$150K", term: "6 months", yield: "5.8%", paidOn: "Dec 29" },
  { id: "CL-900", borrower: "Synapse Guild", plan: "Treasure Vault", volume: "$820K", term: "18 months", yield: "7.2%", paidOn: "Dec 20" },
]

const highlights = [
  { label: "Capital returned", value: "$6.1M", detail: "+$480K vs last quarter" },
  { label: "Weighted APR", value: "6.45%", detail: "Blended across 42 loans" },
  { label: "Avg cycle", value: "10.8 months", detail: "-0.3 month improvement" },
]

export default function CompletedLoans() {
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
          <h1 className="text-3xl font-bold text-gray-900">Completed Loans</h1>
          <p className="text-sm text-gray-500">Recently closed exposures with realized yield and cycle efficiency.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-400">{highlight.label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{highlight.value}</p>
              <p className="text-xs text-gray-500">{highlight.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recently closed</h2>
              <p className="text-sm text-gray-500">Capital back in the treasury and ready for redeployment.</p>
            </div>
            <button className="text-sm font-semibold text-orange-500">Download ledger</button>
          </div>

          <div className="mt-6 space-y-4 text-sm text-gray-600">
            <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
              <span>Borrower</span>
              <span>Plan</span>
              <span>Yield</span>
              <span>Paid on</span>
            </div>
            {closedDeals.map((deal) => (
              <div
                key={deal.id}
                className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-md md:grid-cols-[2fr,1fr,1fr,1fr]"
              >
                <div>
                  <p className="font-semibold text-gray-900">{deal.borrower}</p>
                  <p className="text-xs text-gray-500">{deal.id} • {deal.volume}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{deal.plan}</p>
                  <p className="text-xs text-gray-500">{deal.term}</p>
                </div>
                <div className="font-semibold text-gray-900">{deal.yield}</div>
                <div className="font-medium text-gray-700">{deal.paidOn}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

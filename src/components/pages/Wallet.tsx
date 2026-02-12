import { Activity, RefreshCcw, TrendingUp } from "lucide-react"
import adminProfile from "../../assets/will.png"

const ethPricePoints = [
  { label: "Mon", value: 3120 },
  { label: "Tue", value: 3164 },
  { label: "Wed", value: 3092 },
  { label: "Thu", value: 3218 },
  { label: "Fri", value: 3296 },
  { label: "Sat", value: 3334 },
  { label: "Sun", value: 3310 },
]

const volatilityUpdates = [
  { title: "Options skew flips positive", detail: "Traders price in $3.5K calls for end of week.", tone: "bullish" },
  { title: "Funding rate cools", detail: "Perp markets normalize after 2.1% spike.", tone: "neutral" },
  { title: "L2 flows accelerate", detail: "+$480M bridged into Arbitrum + Base over 24h.", tone: "bullish" },
  { title: "Macro correlation warning", detail: "ETH beta to Nasdaq rises to 0.82.", tone: "bearish" },
]

export default function Wallet() {
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
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-sm text-gray-500">Live price action, volatility signals, and predictive guidance.</p>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/60">Wallet balance</p>
              <p className="mt-2 text-4xl font-semibold">2,678 ETH</p>
              <p className="text-sm text-emerald-400">≈ $3,334.21 spot • +2.8% 24h</p>
              <p className="mt-2 text-xs text-white/70">Avelon's treasury is fully Ethereum-native. No other assets tracked here.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold">
                <TrendingUp size={16} /> 24h momentum
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold">
                <RefreshCcw size={16} /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Price prediction</h2>
                <p className="text-sm text-gray-500">Short-term models blending on-chain flows and derivatives data.</p>
              </div>
              <button className="text-sm font-semibold text-orange-500">View model</button>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <svg viewBox="0 0 320 140" className="h-44 w-full">
                <defs>
                  <linearGradient id="ethPrediction" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 100 L53 82 L106 94 L160 60 L213 44 L266 28 L320 36"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path d="M0 100 L53 82 L106 94 L160 60 L213 44 L266 28 L320 36 L320 140 L0 140 Z" fill="url(#ethPrediction)" />
                <g className="text-xs fill-gray-500">
                  {ethPricePoints.map((point, index) => (
                    <text key={point.label} x={index * 53 + 10} y={128}>
                      {point.label}
                    </text>
                  ))}
                </g>
              </svg>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-xs uppercase text-gray-400">Next 24h</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">$3,410 ± $120</p>
                <p className="text-sm text-emerald-600">Confidence 74%</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-xs uppercase text-gray-400">7-day outlook</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">Bullish drift</p>
                <p className="text-sm text-emerald-600">Volatility 31%</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity size={18} className="text-emerald-500" />
                Signals weighted more heavily when L2 inflow + DeFi TVL diverge.
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs uppercase text-gray-400">Model inputs</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Spot + perp basis</li>
                    <li>• L2 net flow velocity</li>
                    <li>• Macro volatility regime</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs uppercase text-gray-400">Risk guidance</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Maintain delta-neutral covers</li>
                    <li>• Avoid leverage {'>'}2.5x</li>
                    <li>• Monitor macro open</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">ETH volatility updates</h2>
            <p className="text-sm text-gray-500">Signals curated for treasury and trading stakeholders.</p>
            <div className="mt-6 space-y-5">
              {volatilityUpdates.map((update) => (
                <div key={update.title} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-gray-400">
                    {update.tone === "bullish" && <span className="text-emerald-600">Bullish</span>}
                    {update.tone === "bearish" && <span className="text-rose-600">Bearish</span>}
                    {update.tone === "neutral" && <span className="text-gray-500">Neutral</span>}
                  </div>
                  <p className="mt-1 text-base font-semibold text-gray-900">{update.title}</p>
                  <p className="text-sm text-gray-600">{update.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Activity, AlertTriangle, Brain, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { useCachedFetch } from "@/lib/use-cached-fetch"

type PriceBand = { lower: number; upper: number }

type VolatilityData = {
    online: boolean
    horizonDays: number
    advisoryOnly?: boolean
    liquidationEnabled?: boolean
    economicNote?: string
    currentPricePHP?: number
    priceSource?: "coingecko" | "snapshot"
    model?: "lstm" | "ewma_fallback"
    predictedVolatility?: number
    realizedVolatility24h?: number
    horizonVolatility?: number
    riskLevel?: "LOW" | "MODERATE" | "HIGH" | "EXTREME"
    priceRange68?: PriceBand
    priceRange95?: PriceBand
    recentPrices?: number[]
    modelMetadata?: {
        log_vol_mae?: number
        baselines?: Record<string, number>
        trained_points?: number
        horizon_hours?: number
    }
}

const RISK_STYLES: Record<string, string> = {
    LOW: "bg-green-50 text-green-700 border-green-200",
    MODERATE: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    EXTREME: "bg-red-50 text-red-700 border-red-200",
}

function peso(value?: number) {
    if (value === undefined) return "—"
    return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`
}

function percent(value?: number, digits = 1) {
    if (value === undefined) return "—"
    return `${(value * 100).toFixed(digits)}%`
}

/**
 * Price history with the projected 95% band extending off the right edge.
 * Hand-rolled because the admin bundle carries no charting library.
 */
function PriceChart({ prices, band }: { prices: number[]; band?: PriceBand }) {
    if (prices.length < 2) return null

    const width = 900
    const height = 240
    const padding = { top: 16, right: 150, bottom: 24, left: 8 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom

    const values = band ? [...prices, band.lower, band.upper] : prices
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1

    const x = (i: number) => padding.left + (i / (prices.length - 1)) * plotWidth
    const y = (v: number) => padding.top + (1 - (v - min) / span) * plotHeight

    const line = prices.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p)}`).join(" ")
    const area = `${line} L ${x(prices.length - 1)} ${padding.top + plotHeight} L ${padding.left} ${padding.top + plotHeight} Z`

    const lastX = x(prices.length - 1)
    const lastY = y(prices[prices.length - 1])
    const edgeX = width - padding.right + 40

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
            <defs>
                <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
            </defs>

            {band && (
                <>
                    {/* Forecast cone: where the price sits with 95% confidence at the horizon. */}
                    <path
                        d={`M ${lastX} ${lastY} L ${edgeX} ${y(band.upper)} L ${edgeX} ${y(band.lower)} Z`}
                        fill="#f97316"
                        fillOpacity="0.12"
                    />
                    <line x1={lastX} y1={lastY} x2={edgeX} y2={y(band.upper)} stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" />
                    <line x1={lastX} y1={lastY} x2={edgeX} y2={y(band.lower)} stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" />
                    <text x={edgeX + 6} y={y(band.upper) + 4} fontSize="11" fill="#6b7280">{peso(band.upper)}</text>
                    <text x={edgeX + 6} y={y(band.lower) + 4} fontSize="11" fill="#6b7280">{peso(band.lower)}</text>
                </>
            )}

            <path d={area} fill="url(#volFill)" />
            <path d={line} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
            <circle cx={lastX} cy={lastY} r="4" fill="#f97316" />
        </svg>
    )
}

export default function Volatility() {
    const { data, loading, error, refresh } = useCachedFetch<VolatilityData>("/api/v1/admin/volatility")

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-gray-900">ETH Volatility</h1>
                        <p className="text-sm text-gray-500">
                            Advisory LSTM research forecast for ETH/PHP market volatility.
                        </p>
                    </div>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {loading && (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
                                <div className="h-8 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
                    </div>
                )}

                {!loading && !error && data && !data.online && (
                    <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                            <strong>Prediction service unreachable.</strong> The AI service is down or still starting up. Retry in a moment.
                        </p>
                    </div>
                )}

                {!loading && !error && data?.online && (
                    <>
                        <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4">
                            <AlertTriangle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900">
                                <strong>Advisory research only.</strong> {data.economicNote ?? "ETH volatility cannot change an ETH-collateral/ETH-debt ratio and does not trigger liquidation."}
                            </p>
                        </div>
                        {data.priceSource === "snapshot" && (
                            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-800">
                                    <strong>Using the offline price snapshot.</strong> The live CoinGecko feed could not be reached,
                                    so this forecast runs on committed historical prices rather than current ones.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-orange-50 p-3">
                                        <Activity size={18} className="text-orange-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Predicted Volatility</p>
                                        <p className="text-lg font-semibold text-gray-900">{percent(data.predictedVolatility)}</p>
                                        <p className="text-xs text-gray-500">annualized</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-gray-50 p-3">
                                        <TrendingUp size={18} className="text-gray-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">ETH Price</p>
                                        <p className="text-lg font-semibold text-gray-900">{peso(data.currentPricePHP)}</p>
                                        <p className="text-xs text-gray-500 capitalize">{data.priceSource}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-gray-50 p-3">
                                        <TrendingDown size={18} className="text-gray-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Realized (24h)</p>
                                        <p className="text-lg font-semibold text-gray-900">{percent(data.realizedVolatility24h)}</p>
                                        <p className="text-xs text-gray-500">what actually happened</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-gray-50 p-3">
                                        <Brain size={18} className="text-gray-600" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">Risk Level</p>
                                        <span className={`mt-1 inline-block rounded-lg border px-2 py-0.5 text-sm font-semibold ${RISK_STYLES[data.riskLevel ?? "LOW"]}`}>
                                            {data.riskLevel}
                                        </span>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.model === "lstm" ? "PyTorch LSTM" : "EWMA fallback"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Price and forecast cone</h2>
                                    <p className="text-sm text-gray-500">
                                        Last 7 days of hourly closes, with the 95% range {data.horizonDays} days out.
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    68%: {peso(data.priceRange68?.lower)} – {peso(data.priceRange68?.upper)}
                                </span>
                            </div>
                            <PriceChart prices={data.recentPrices ?? []} band={data.priceRange95} />
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">Risk-policy boundary</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                The forecast can support research discussion and administrator awareness. Smart-contract liquidation is limited to an objectively overdue default; predicted price movement and owner-supplied ratios are not enforcement inputs.
                            </p>
                        </div>

                        {data.modelMetadata?.baselines && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900">Model accuracy</h2>
                                <p className="mb-4 text-sm text-gray-500">
                                    Mean absolute error on held-out data, in log volatility. Lower is better — the LSTM has to
                                    beat these to be worth using.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-orange-500">LSTM</p>
                                        <p className="text-xl font-semibold text-orange-700">
                                            {data.modelMetadata.log_vol_mae?.toFixed(4)}
                                        </p>
                                    </div>
                                    {Object.entries(data.modelMetadata.baselines).map(([name, value]) => (
                                        <div key={name} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-400">{name}</p>
                                            <p className="text-xl font-semibold text-gray-700">{value.toFixed(4)}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-xs text-gray-400">
                                    Trained on {data.modelMetadata.trained_points?.toLocaleString()} hourly ETH/PHP closes,
                                    forecasting {data.modelMetadata.horizon_hours}h realized volatility.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

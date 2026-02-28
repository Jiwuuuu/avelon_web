"use client"

import { RefreshCcw, TrendingUp, TrendingDown } from "lucide-react"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { WalletSkeleton } from "@/components/skeletons"

type MarketPrice = {
  ethPricePHP: number
  source: string
  change24h: number
  changePercent24h: number
  updatedAt: string
}

type PriceHistory = {
  id: string
  ethPricePHP: number
  source: string
  createdAt: string
}

type TreasuryInfo = {
  balance: number
  totalLent: number
  totalCollected: number
}

export default function Wallet() {
  const { data: price, loading: l1, error: e1, refresh: r1 } = useCachedFetch<MarketPrice>("/api/v1/market/price")
  const { data: historyData, loading: l2, error: e2, refresh: r2 } = useCachedFetch<{ history: PriceHistory[] }>("/api/v1/market/price/history?days=7")
  const { data: treasury, loading: l3, error: e3, refresh: r3 } = useCachedFetch<TreasuryInfo>("/api/v1/admin/treasury")

  const loading = l1 || l2 || l3
  const error = e1 || e2 || e3
  const history = historyData?.history ?? []
  const refreshAll = () => { r1(); r2(); r3() }

  const isPositive = (price?.changePercent24h ?? 0) >= 0

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-sm text-gray-500">Treasury overview and ETH market data.</p>
        </div>

        {loading && <WalletSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refreshAll} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Treasury Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-lg">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">Treasury Balance</p>
                  <p className="mt-2 text-4xl font-semibold">{treasury ? Number(treasury.balance).toFixed(2) : "—"} ETH</p>
                  {price && (
                    <p className={`text-sm ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      ≈ ₱{Number(price.ethPricePHP).toLocaleString()} spot • {isPositive ? "+" : ""}{Number(price.changePercent24h).toFixed(2)}% 24h
                    </p>
                  )}
                  <p className="mt-2 text-xs text-white/70">Avelon treasury is fully Ethereum-native.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={refreshAll}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold"
                  >
                    <RefreshCcw size={16} /> Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total Lent</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{treasury ? Number(treasury.totalLent).toFixed(2) : "—"} ETH</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total Collected</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{treasury ? Number(treasury.totalCollected).toFixed(2) : "—"} ETH</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">ETH Price (PHP)</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-semibold text-gray-900">₱{price ? Number(price.ethPricePHP).toLocaleString() : "—"}</p>
                  {isPositive ? <TrendingUp size={20} className="text-emerald-500" /> : <TrendingDown size={20} className="text-rose-500" />}
                </div>
              </div>
            </div>

            {/* Price History */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">7-Day Price History</h2>
              <p className="text-sm text-gray-500 mb-6">ETH/PHP spot price from {price?.source ?? "oracle"}.</p>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No price history available.</div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 14).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                      <span className="text-sm text-gray-600">{new Date(entry.createdAt).toLocaleString()}</span>
                      <span className="text-sm font-semibold text-gray-900">₱{Number(entry.ethPricePHP).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

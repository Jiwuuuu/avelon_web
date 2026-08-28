"use client"

import { RefreshCcw, TrendingUp, TrendingDown, Landmark, Lock, ArrowRightLeft, Wallet as WalletIcon } from "lucide-react"
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
  balance: string
  totalLent: string
  totalCollected: string
  totalFees: string
  totalInterestCollected?: string
  collateralLocked: string
  activeLoansCount: number
  treasuryAddress: string | null
  collateralManagerAddress?: string | null
  network: { name: string; chainId: string }
  _warning?: string
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
  const ethPrice = price ? Number(price.ethPricePHP) : 0
  const treasuryBalanceETH = treasury ? parseFloat(treasury.balance) : 0
  const treasuryBalancePHP = treasuryBalanceETH * ethPrice

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-sm text-gray-500">
            Treasury overview and ETH market data
            {treasury?.network && treasury.network.name !== 'unknown' && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                {treasury.network.name === 'base-sepolia' ? 'Base Sepolia Testnet' : treasury.network.name}
              </span>
            )}
          </p>
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
                  <p className="text-sm uppercase tracking-wide text-white/60">Treasury Balance (Base Sepolia)</p>
                  <p className="mt-2 text-4xl font-semibold">{treasuryBalanceETH.toFixed(4)} ETH</p>
                  {price && (
                    <p className={`text-sm ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      ≈ ₱{treasuryBalancePHP.toLocaleString(undefined, { maximumFractionDigits: 2 })} • {isPositive ? "+" : ""}{Number(price.changePercent24h).toFixed(2)}% 24h
                    </p>
                  )}
                  {treasury?.treasuryAddress && (
                    <p className="mt-2 text-xs text-white/50 font-mono">
                      {treasury.treasuryAddress.slice(0, 6)}...{treasury.treasuryAddress.slice(-4)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={refreshAll}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
                  >
                    <RefreshCcw size={16} /> Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark size={16} className="text-blue-500" />
                  <p className="text-xs uppercase tracking-wide text-gray-400">Total Lent</p>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{treasury ? parseFloat(treasury.totalLent).toFixed(4) : "—"} ETH</p>
                {treasury && ethPrice > 0 && (
                  <p className="text-xs text-gray-400 mt-1">≈ ₱{(parseFloat(treasury.totalLent) * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                )}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRightLeft size={16} className="text-emerald-500" />
                  <p className="text-xs uppercase tracking-wide text-gray-400">Total Collected</p>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{treasury ? parseFloat(treasury.totalCollected).toFixed(4) : "—"} ETH</p>
                {treasury && ethPrice > 0 && (
                  <p className="text-xs text-gray-400 mt-1">≈ ₱{(parseFloat(treasury.totalCollected) * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                )}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={16} className="text-amber-500" />
                  <p className="text-xs uppercase tracking-wide text-gray-400">Collateral Locked</p>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{treasury ? parseFloat(treasury.collateralLocked).toFixed(4) : "—"} ETH</p>
                {treasury && (
                  <p className="text-xs text-gray-400 mt-1">{treasury.activeLoansCount} active loan{treasury.activeLoansCount !== 1 ? 's' : ''}</p>
                )}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <WalletIcon size={16} className="text-purple-500" />
                  <p className="text-xs uppercase tracking-wide text-gray-400">ETH Price (PHP)</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-gray-900">₱{price ? Number(price.ethPricePHP).toLocaleString() : "—"}</p>
                  {isPositive ? <TrendingUp size={18} className="text-emerald-500" /> : <TrendingDown size={18} className="text-rose-500" />}
                </div>
                {price && (
                  <p className={`text-xs mt-1 ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPositive ? "+" : ""}{Number(price.change24h).toLocaleString()} 24h
                  </p>
                )}
              </div>
            </div>

            {/* Fees & Interest */}
            {treasury?.totalFees && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Total Origination Fees</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{parseFloat(treasury.totalFees).toFixed(4)} ETH</p>
                </div>
                {treasury.totalInterestCollected && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Total Interest Collected</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{parseFloat(treasury.totalInterestCollected).toFixed(4)} ETH</p>
                  </div>
                )}
              </div>
            )}

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

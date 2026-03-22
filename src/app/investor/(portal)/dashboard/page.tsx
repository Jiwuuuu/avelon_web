"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Droplets,
  LineChart,
  PiggyBank,
  Target,
  Waves,
} from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";

const accent = "#E85C1A";

type PoolStats = {
  tvl: number;
  totalBorrowed: number;
  utilizationRate: number;
  apy: number;
  totalInvestors: number;
  activeLoans: number;
  lastUpdated: string;
};

type PoolTransaction = {
  id: string;
  type: string;
  amount: number;
  txHash: string | null;
  userId: string | null;
  createdAt: string;
};

type DashboardData = {
  totalDeposited: number;
  currentValue: number;
  totalYieldEarned: number;
  claimableYield: number;
  pool: PoolStats;
  recentTransactions: PoolTransaction[];
};

function txLabel(type: string): string {
  if (type === "DEPOSIT") return "Pool deposit";
  if (type === "WITHDRAWAL") return "Withdrawal";
  if (type === "YIELD_EARNED") return "Yield accrual";
  if (type === "FEE_COLLECTED") return "Platform fee";
  return type;
}

function txSign(type: string): string {
  return type === "WITHDRAWAL" || type === "FEE_COLLECTED" ? "−" : "+";
}

export default function InvestorDashboardPage() {
  const { data, loading, error } = useCachedFetch<DashboardData>("/api/v1/investor/dashboard");

  const totalDeposited = data?.totalDeposited ?? 0;
  const totalYieldEarned = data?.totalYieldEarned ?? 0;
  const pool = data?.pool;
  const recentTransactions = data?.recentTransactions ?? [];

  const utilizationPct = pool ? pool.utilizationRate * 100 : 0;
  const apyPct = pool ? (pool.apy * 100).toFixed(1) : "—";

  // Derive pool share % from deposited vs tvl
  const poolShare = pool && pool.tvl > 0 ? ((totalDeposited / pool.tvl) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Your portfolio and pool performance overview.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">Portfolio summary</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Total deposited</span>
              <PiggyBank className="h-5 w-5 text-[#E85C1A]" style={{ color: accent }} />
            </div>
            {loading ? (
              <div className="h-8 w-28 bg-stone-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{totalDeposited.toFixed(4)} ETH</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Pool share</span>
              <Droplets className="h-5 w-5" style={{ color: accent }} />
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-stone-100 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold">{poolShare}%</p>
                <p className="text-xs text-stone-500 mt-1">Of total pool</p>
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Total yield earned</span>
              <Target className="h-5 w-5" style={{ color: accent }} />
            </div>
            {loading ? (
              <div className="h-8 w-28 bg-stone-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">+{totalYieldEarned.toFixed(6)} ETH</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">Liquidity pool statistics</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <span className="text-sm text-stone-500">Total pool (TVL)</span>
            {loading ? (
              <div className="h-7 w-24 bg-stone-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold mt-1">{(pool?.tvl ?? 0).toFixed(4)} ETH</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <span className="text-sm text-stone-500">Currently lent out</span>
            {loading ? (
              <div className="h-7 w-24 bg-stone-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold mt-1">{(pool?.totalBorrowed ?? 0).toFixed(4)} ETH</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <span className="text-sm text-stone-500">Pool utilization</span>
            {loading ? (
              <div className="h-7 w-20 bg-stone-100 rounded animate-pulse mt-1" />
            ) : (
              <>
                <p className="text-xl font-bold mt-1">{utilizationPct.toFixed(1)}%</p>
                <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#E85C1A]" style={{ width: `${utilizationPct}%` }} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Recent transactions</h2>
            <Link href="/investor/transactions" className="text-xs font-medium text-[#E85C1A] hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentTransactions.slice(0, 3).map((tx) => (
                <li key={tx.id} className="py-3 flex items-start justify-between gap-3 first:pt-0">
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{txLabel(tx.type)}</p>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">
                      {tx.txHash ? `${tx.txHash.slice(0, 10)}…` : "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.type === "WITHDRAWAL" ? "text-red-600" : "text-emerald-600"}`}>
                      {txSign(tx.type)}{tx.amount.toFixed(6)} ETH
                    </p>
                    <span className="text-[10px] text-stone-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-4 w-4 text-[#E85C1A]" />
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Pool APY</h2>
          </div>
          <div className="flex items-center justify-center h-36">
            <div className="text-center">
              <p className="text-5xl font-bold text-[#E85C1A]">{apyPct}%</p>
              <p className="text-sm text-stone-500 mt-2">Current annualised yield</p>
              <p className="text-xs text-stone-400 mt-1">
                {pool ? `${pool.totalInvestors} investors · ${pool.activeLoans} active loans` : "Loading…"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/investor/invest"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E85C1A] text-white text-sm font-semibold shadow-sm hover:opacity-95"
          >
            <ArrowUpRight className="h-4 w-4" />
            Invest funds
          </Link>
          <Link
            href="/investor/withdraw"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-semibold hover:bg-stone-50"
          >
            <ArrowDownRight className="h-4 w-4" />
            Withdraw funds
          </Link>
          <Link
            href="/investor/pool"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-semibold hover:bg-stone-50"
          >
            <Waves className="h-4 w-4 text-[#E85C1A]" />
            View pool details
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import { LineChart, Percent, Users } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";

type PoolStats = {
  tvl: number;
  totalBorrowed: number;
  utilizationRate: number;
  apy: number;
  totalInvestors: number;
  activeLoans: number;
  lastUpdated: string;
};

export default function PoolOverviewPage() {
  const { data, loading, error } = useCachedFetch<PoolStats>("/api/v1/investor/pool");

  const utilizationPct = data ? data.utilizationRate * 100 : 0;
  const apyPct = data ? (data.apy * 100).toFixed(1) : "—";

  function stat(val: React.ReactNode) {
    if (loading) return <div className="h-8 w-24 bg-stone-100 rounded animate-pulse mt-1" />;
    return <p className="text-2xl font-bold mt-1">{val}</p>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Liquidity pool overview</h1>
        <p className="text-stone-500 text-sm mt-1">Transparency into aggregate lending pool performance.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Total liquidity (TVL)</p>
          {stat(`${(data?.tvl ?? 0).toFixed(4)} ETH`)}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-start gap-3">
          <Users className="h-5 w-5 text-[#E85C1A] shrink-0" />
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Total investors</p>
            {stat((data?.totalInvestors ?? 0).toLocaleString())}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Active loans funded</p>
          {stat(data?.activeLoans ?? 0)}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Pool utilization</p>
          {loading ? (
            <div className="h-8 w-24 bg-stone-100 rounded animate-pulse mt-1" />
          ) : (
            <>
              <p className="text-2xl font-bold mt-1">{utilizationPct.toFixed(1)}%</p>
              <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-[#E85C1A] rounded-full" style={{ width: `${utilizationPct}%` }} />
              </div>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-start gap-3">
          <Percent className="h-5 w-5 text-[#E85C1A] shrink-0" />
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Current APY</p>
            {stat(`${apyPct}%`)}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Currently lent out</p>
          {stat(`${(data?.totalBorrowed ?? 0).toFixed(4)} ETH`)}
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-[#E85C1A]" />
            <h2 className="font-semibold text-stone-900">Pool metrics</h2>
          </div>
          {data?.lastUpdated && (
            <span className="text-xs text-stone-400">
              Updated {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <div className="border border-stone-100 rounded-xl p-4">
            <p className="text-stone-500">Available liquidity</p>
            <p className="text-lg font-bold mt-1">
              {((data?.tvl ?? 0) - (data?.totalBorrowed ?? 0)).toFixed(4)} ETH
            </p>
          </div>
          <div className="border border-stone-100 rounded-xl p-4">
            <p className="text-stone-500">Utilization rate</p>
            <p className="text-lg font-bold mt-1">{utilizationPct.toFixed(2)}%</p>
          </div>
        </div>
      </section>
    </div>
  );
}

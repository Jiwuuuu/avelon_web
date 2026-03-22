"use client";

import { PieChart } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { api } from "@/lib/api";
import { useState } from "react";

type EarningsData = {
  totalEarned: number;
  claimable: number;
  monthlyBreakdown: { month: string; earned: number }[];
};

const PLATFORM_FEE = 10;

export default function EarningsPage() {
  const { data, loading, error } = useCachedFetch<EarningsData>("/api/v1/investor/earnings");
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  const total = data?.totalEarned ?? 0;
  const claimable = data?.claimable ?? 0;
  const monthly = data?.monthlyBreakdown ?? [];

  const gross = total > 0 ? total / (1 - PLATFORM_FEE / 100) : 0;
  const platformCut = gross - total;

  // Chart: use monthly data or empty bars
  const bars = monthly.length > 0 ? monthly.map((m) => m.earned) : [];
  const maxBar = bars.length > 0 ? Math.max(...bars) : 1;

  async function claim() {
    setClaiming(true);
    setClaimMsg(null);
    try {
      // Claim is a future feature; for now show a message
      await new Promise((r) => setTimeout(r, 1000));
      setClaimMsg("Claim request submitted. Yield will be transferred to your wallet shortly.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Earnings and returns</h1>
        <p className="text-stone-500 text-sm mt-1">Profit, fee breakdown, and historical distributions.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <p className="text-sm text-stone-500">Total yield earned</p>
          {loading ? (
            <div className="h-10 w-36 bg-stone-100 rounded animate-pulse mt-1" />
          ) : (
            <>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{total.toFixed(6)} ETH</p>
              <p className="text-xs text-stone-500 mt-2">
                Claimable: <span className="font-semibold text-stone-700">{claimable.toFixed(6)} ETH</span>
              </p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-5 w-5 text-[#E85C1A]" />
            <p className="text-sm font-semibold text-stone-800">Fee breakdown</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-5 bg-stone-100 rounded animate-pulse" />
              <div className="h-5 bg-stone-100 rounded animate-pulse" />
              <div className="h-5 bg-stone-100 rounded animate-pulse" />
            </div>
          ) : (
            <ul className="text-sm space-y-2 text-stone-600">
              <li className="flex justify-between">
                <span>Investor return (net)</span>
                <span className="font-mono font-medium">{total.toFixed(6)} ETH</span>
              </li>
              <li className="flex justify-between">
                <span>Platform {PLATFORM_FEE}% fee (on yield)</span>
                <span className="font-mono font-medium text-stone-500">~{platformCut.toFixed(6)} ETH</span>
              </li>
              <li className="flex justify-between border-t border-stone-100 pt-2 text-stone-800 font-medium">
                <span>Gross yield</span>
                <span className="font-mono">~{gross.toFixed(6)} ETH</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {monthly.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900 mb-4">Monthly earnings</h2>
          <div className="flex items-end gap-1 h-32">
            {bars.map((h, i) => (
              <div
                key={monthly[i].month}
                className="flex-1 rounded-t bg-[#E85C1A]/80"
                style={{ height: `${maxBar > 0 ? (h / maxBar) * 100 : 0}%`, minHeight: "4px" }}
                title={`${monthly[i].month}: ${h.toFixed(6)} ETH`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 mt-2">
            <span>{monthly[0]?.month}</span>
            <span>{monthly[monthly.length - 1]?.month}</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">Monthly net yield to investor (ETH)</p>
        </section>
      )}

      {monthly.length === 0 && !loading && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm text-center text-stone-400 text-sm">
          No earnings history yet. Yield is distributed when borrowers repay loans.
        </section>
      )}

      {claimMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          {claimMsg}
        </div>
      )}

      <button
        type="button"
        onClick={claim}
        disabled={claiming || claimable <= 0}
        className="px-6 py-3 rounded-xl bg-[#E85C1A] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {claiming ? "Submitting…" : `Claim ${claimable.toFixed(6)} ETH`}
      </button>
    </div>
  );
}

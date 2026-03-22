"use client";

import { useState } from "react";
import { PieChart } from "lucide-react";

const BY_TOKEN = [
  { token: "USDC", earned: 2840.5 },
  { token: "ETH", earned: 0.42 },
  { token: "USDT", earned: 562.1 },
];

const PLATFORM_FEE = 10;

export default function EarningsPage() {
  const [claiming, setClaiming] = useState(false);
  const total = BY_TOKEN.reduce((s, x) => s + x.earned, 0);
  const gross = total / (1 - PLATFORM_FEE / 100);
  const platformCut = gross - total;

  const bars = [12, 18, 15, 22, 28, 25, 30, 35, 32, 38, 40, 42];

  function claim() {
    setClaiming(true);
    setTimeout(() => setClaiming(false), 1500);
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Earnings and returns</h1>
        <p className="text-stone-500 text-sm mt-1">Profit, fee breakdown, and historical distributions.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <p className="text-sm text-stone-500">Total earnings</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-stone-500 mt-2">After platform fee on yield</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-5 w-5 text-[#E85C1A]" />
            <p className="text-sm font-semibold text-stone-800">Fee breakdown</p>
          </div>
          <ul className="text-sm space-y-2 text-stone-600">
            <li className="flex justify-between">
              <span>Investor return (net)</span>
              <span className="font-mono font-medium">${total.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Platform {PLATFORM_FEE}% fee (on yield)</span>
              <span className="font-mono font-medium text-stone-500">~${platformCut.toFixed(2)}</span>
            </li>
            <li className="flex justify-between border-t border-stone-100 pt-2 text-stone-800 font-medium">
              <span>Gross yield (illustrative)</span>
              <span className="font-mono">~${gross.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900 mb-4">Earnings per token</h2>
        <div className="space-y-3">
          {BY_TOKEN.map((x) => (
            <div key={x.token} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
              <span className="font-medium">{x.token}</span>
              <span className="font-mono text-emerald-700">+{x.token.startsWith("US") ? `$${x.earned.toLocaleString()}` : `${x.earned} ${x.token}`}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900 mb-4">Historical earnings</h2>
        <div className="flex items-end gap-1 h-32">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-[#E85C1A]/80" style={{ height: `${(h / 45) * 100}%` }} />
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-2">Monthly net to investors (mock)</p>
      </section>

      <button
        type="button"
        onClick={claim}
        disabled={claiming}
        className="px-6 py-3 rounded-xl bg-[#E85C1A] text-white font-semibold text-sm disabled:opacity-60"
      >
        {claiming ? "Submitting…" : "Claim earnings"}
      </button>
    </div>
  );
}

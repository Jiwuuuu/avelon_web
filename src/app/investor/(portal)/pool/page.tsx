"use client";

import { LineChart, Percent, Users } from "lucide-react";

export default function PoolOverviewPage() {
  const stats = {
    poolValue: 1_820_000,
    investors: 2847,
    activeLoans: 412,
    utilization: 72.4,
    avgLoanApr: 11.2,
    onTimeRepay: 94.2,
  };
  const history = [52, 55, 53, 58, 62, 60, 65, 68, 66, 70, 72, 74];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Liquidity pool overview</h1>
        <p className="text-stone-500 text-sm mt-1">Transparency into aggregate lending pool performance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Total liquidity pool value</p>
          <p className="text-2xl font-bold mt-1">${stats.poolValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-start gap-3">
          <Users className="h-5 w-5 text-[#E85C1A] shrink-0" />
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Total investors</p>
            <p className="text-2xl font-bold mt-1">{stats.investors.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Active loans funded</p>
          <p className="text-2xl font-bold mt-1">{stats.activeLoans}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Pool utilization</p>
          <p className="text-2xl font-bold mt-1">{stats.utilization}%</p>
          <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full bg-[#E85C1A] rounded-full" style={{ width: `${stats.utilization}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-start gap-3">
          <Percent className="h-5 w-5 text-[#E85C1A] shrink-0" />
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Average loan interest</p>
            <p className="text-2xl font-bold mt-1">{stats.avgLoanApr}% APR</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">On-time repayment</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.onTimeRepay}%</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="h-5 w-5 text-[#E85C1A]" />
          <h2 className="font-semibold text-stone-900">Historical performance</h2>
        </div>
        <p className="text-xs text-stone-500 mb-4">Pool TVL index (mock)</p>
        <div className="flex items-end gap-1 h-40">
          {history.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-stone-200 to-[#E85C1A]/80"
              style={{ height: `${(h / 80) * 100}%` }}
            />
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900 mb-4">Borrower repayment statistics</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="border border-stone-100 rounded-xl p-4">
            <p className="text-stone-500">Principal repaid (30d)</p>
            <p className="text-lg font-bold mt-1">$2.4M</p>
          </div>
          <div className="border border-stone-100 rounded-xl p-4">
            <p className="text-stone-500">Defaults (rolling)</p>
            <p className="text-lg font-bold mt-1">0.6%</p>
          </div>
        </div>
      </section>
    </div>
  );
}

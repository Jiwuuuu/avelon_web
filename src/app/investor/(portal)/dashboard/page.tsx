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

const accent = "#E85C1A";

export default function InvestorDashboardPage() {
  const portfolio = {
    totalInvested: 42_500,
    liquidityShare: 2.34,
    totalEarnings: 3_842.6,
  };
  const pool = {
    totalSize: 1_820_000,
    borrowerDemand: 486_000,
    utilization: 72.4,
  };
  const recent = [
    { id: "1", type: "deposit", label: "USDC deposit", amount: "+5,000 USDC", status: "confirmed", tx: "0x8a3…c21" },
    { id: "2", type: "earn", label: "Interest accrual", amount: "+124.50 USDC", status: "confirmed", tx: "—" },
    { id: "3", type: "withdraw", label: "Withdrawal", amount: "−1,200 USDC", status: "pending", tx: "0xf1…9ab" },
  ];
  const chartPoints = [42, 48, 45, 52, 58, 55, 61, 64, 62, 68, 71, 74];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">
          Main overview after your wallet is connected. Figures below are illustrative until on-chain data is wired.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">Portfolio summary</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Total invested</span>
              <PiggyBank className="h-5 w-5 text-[#E85C1A]" style={{ color: accent }} />
            </div>
            <p className="text-2xl font-bold">${portfolio.totalInvested.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Current liquidity share</span>
              <Droplets className="h-5 w-5" style={{ color: accent }} />
            </div>
            <p className="text-2xl font-bold">{portfolio.liquidityShare}%</p>
            <p className="text-xs text-stone-500 mt-1">Of total pool</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Total earnings</span>
              <Target className="h-5 w-5" style={{ color: accent }} />
            </div>
            <p className="text-2xl font-bold text-emerald-600">+${portfolio.totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">Liquidity pool statistics</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <span className="text-sm text-stone-500">Total pool size</span>
            <p className="text-xl font-bold mt-1">${pool.totalSize.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <span className="text-sm text-stone-500">Borrower demand</span>
            <p className="text-xl font-bold mt-1">${pool.borrowerDemand.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <span className="text-sm text-stone-500">Pool utilization</span>
            <p className="text-xl font-bold mt-1">{pool.utilization}%</p>
            <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#E85C1A]" style={{ width: `${pool.utilization}%` }} />
            </div>
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
          <ul className="divide-y divide-stone-100">
            {recent.map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-3 first:pt-0">
                <div>
                  <p className="font-medium text-stone-900 text-sm">{r.label}</p>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">{r.tx}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-semibold ${
                      r.type === "withdraw" ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {r.amount}
                  </p>
                  <span
                    className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                      r.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-4 w-4 text-[#E85C1A]" />
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Performance</h2>
          </div>
          <p className="text-xs text-stone-500 mb-4">Trailing 12 months (mock)</p>
          <div className="flex items-end gap-1 h-36 px-1">
            {chartPoints.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#E85C1A]/30 to-[#E85C1A] min-h-[8px]"
                style={{ height: `${(h / 80) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 mt-2">
            <span>Jan</span>
            <span>Dec</span>
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

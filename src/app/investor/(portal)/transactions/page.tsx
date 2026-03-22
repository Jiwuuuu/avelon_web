"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

type Row = {
  id: string;
  kind: "deposit" | "withdrawal" | "earnings";
  date: string;
  amount: string;
  hash: string;
  status: "pending" | "confirmed" | "failed";
};

const DATA: Row[] = [
  { id: "1", kind: "deposit", date: "2025-03-18", amount: "+5,000 USDC", hash: "0x8a31…c210", status: "confirmed" },
  { id: "2", kind: "earnings", date: "2025-03-17", amount: "+124.5 USDC", hash: "0x71ee…9021", status: "confirmed" },
  { id: "3", kind: "withdrawal", date: "2025-03-15", amount: "−1,200 USDC", hash: "0xf1ab…d009", status: "pending" },
  { id: "4", kind: "deposit", date: "2025-03-10", amount: "+2 ETH", hash: "0xcc02…81aa", status: "failed" },
];

export default function TransactionsPage() {
  const [status, setStatus] = useState<"all" | Row["status"]>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return DATA.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    });
  }, [status, from, to]);

  const sections: { title: string; kind: Row["kind"] }[] = [
    { title: "Deposit history", kind: "deposit" },
    { title: "Withdrawal history", kind: "withdrawal" },
    { title: "Earnings distribution", kind: "earnings" },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Investment transactions</h1>
        <p className="text-stone-500 text-sm mt-1">Deposits, withdrawals, and earnings with on-chain references.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-stone-500 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500 block mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-stone-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500 block mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-stone-200 px-3 py-2 text-sm" />
        </div>
      </div>

      {sections.map(({ title, kind }) => {
        const rows = filtered.filter((r) => r.kind === kind);
        if (rows.length === 0) return null;
        return (
          <section key={title} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold text-stone-800 px-5 py-3 border-b border-stone-100 bg-stone-50">{title}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Smart contract tx</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-5 py-3 text-stone-600">{r.date}</td>
                    <td className="px-5 py-3 font-mono font-medium">{r.amount}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-stone-600 inline-flex items-center gap-1">
                        {r.hash}
                        <ExternalLink className="h-3 w-3 text-stone-400" />
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          r.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-800"
                            : r.status === "pending"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";

type TxType = "DEPOSIT" | "WITHDRAWAL" | "YIELD_EARNED" | "FEE_COLLECTED";

type PoolTx = {
  id: string;
  type: TxType;
  amount: number;
  txHash: string | null;
  userId: string | null;
  createdAt: string;
};

type TxResponse = {
  transactions: PoolTx[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type KindFilter = "all" | TxType;

const KIND_LABELS: Record<TxType, string> = {
  DEPOSIT: "Deposit history",
  WITHDRAWAL: "Withdrawal history",
  YIELD_EARNED: "Earnings distributions",
  FEE_COLLECTED: "Platform fees",
};

function statusBadge(type: TxType) {
  if (type === "DEPOSIT") return "bg-blue-50 text-blue-800";
  if (type === "WITHDRAWAL") return "bg-amber-50 text-amber-800";
  if (type === "YIELD_EARNED") return "bg-emerald-50 text-emerald-800";
  return "bg-stone-100 text-stone-700";
}

function amountSign(type: TxType) {
  return type === "WITHDRAWAL" || type === "FEE_COLLECTED" ? "−" : "+";
}

export default function TransactionsPage() {
  const { data, loading, error } = useCachedFetch<TxResponse>("/api/v1/investor/transactions?limit=100");

  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const allTx = data?.transactions ?? [];

  const filtered = useMemo(() => {
    return allTx.filter((r) => {
      if (kindFilter !== "all" && r.type !== kindFilter) return false;
      const date = r.createdAt.slice(0, 10);
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });
  }, [allTx, kindFilter, from, to]);

  const groups = (["DEPOSIT", "WITHDRAWAL", "YIELD_EARNED", "FEE_COLLECTED"] as TxType[]).filter((kind) =>
    filtered.some((r) => r.type === kind)
  );

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Investment transactions</h1>
        <p className="text-stone-500 text-sm mt-1">Deposits, withdrawals, and yield distributions.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap gap-3 items-end bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-stone-500 block mb-1">Type</label>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="YIELD_EARNED">Yield</option>
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

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">No transactions found.</div>
      )}

      {groups.map((kind) => {
        const rows = filtered.filter((r) => r.type === kind);
        return (
          <section key={kind} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold text-stone-800 px-5 py-3 border-b border-stone-100 bg-stone-50">
              {KIND_LABELS[kind]}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Tx hash</th>
                  <th className="px-5 py-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-5 py-3 text-stone-600">{r.createdAt.slice(0, 10)}</td>
                    <td className="px-5 py-3 font-mono font-medium">
                      <span className={amountSign(r.type) === "+" ? "text-emerald-700" : "text-red-600"}>
                        {amountSign(r.type)}{r.amount.toFixed(6)} ETH
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-stone-600 inline-flex items-center gap-1">
                        {r.txHash ? `${r.txHash.slice(0, 10)}…` : "—"}
                        {r.txHash && <ExternalLink className="h-3 w-3 text-stone-400" />}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusBadge(r.type)}`}>
                        {r.type.replace("_", " ")}
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

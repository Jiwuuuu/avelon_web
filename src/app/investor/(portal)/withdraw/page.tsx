"use client";

import { useState } from "react";
import { Fuel } from "lucide-react";

const TOKENS = [
  { id: "USDC", withdrawable: 11800, invested: 10000, earnings: 1800 },
  { id: "ETH", withdrawable: 2.1, invested: 1.8, earnings: 0.3 },
];

export default function WithdrawPage() {
  const [token, setToken] = useState(TOKENS[0].id);
  const [amount, setAmount] = useState("");
  const t = TOKENS.find((x) => x.id === token)!;
  const num = parseFloat(amount.replace(/,/g, "")) || 0;
  const gasEth = num > 0 ? "0.00048" : "—";

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Withdraw / Redeem</h1>
        <p className="text-stone-500 text-sm mt-1">Redeem liquidity or claim available earnings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-stone-50 border border-stone-100 p-3">
            <p className="text-stone-500 text-xs">Withdrawable</p>
            <p className="font-bold font-mono mt-0.5">
              {t.withdrawable} {t.id}
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-100 p-3">
            <p className="text-stone-500 text-xs">Invested balance</p>
            <p className="font-bold font-mono mt-0.5">
              {t.invested} {t.id}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-emerald-800 text-xs">Earnings available</p>
            <p className="font-bold font-mono text-emerald-900 mt-0.5">
              {t.earnings} {t.id}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Token</label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          >
            {TOKENS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Withdrawal amount</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-mono"
          />
          <button
            type="button"
            className="text-xs text-[#E85C1A] font-medium mt-1"
            onClick={() => setAmount(String(t.withdrawable))}
          >
            Max
          </button>
          {num > t.withdrawable && <p className="text-xs text-red-600 mt-1">Exceeds withdrawable balance.</p>}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <Fuel className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-stone-800">Gas fee estimate</p>
            <p className="font-mono text-xs mt-0.5">~{gasEth} ETH</p>
            <p className="text-xs text-stone-500 mt-1">Actual cost depends on network conditions.</p>
          </div>
        </div>

        <button
          type="button"
          disabled={num <= 0 || num > t.withdrawable}
          className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm disabled:opacity-40"
        >
          Confirm withdrawal
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Fuel, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useCachedFetch } from "@/lib/use-cached-fetch";

type Deposit = {
  id: string;
  amount: number;
  txHash: string;
  status: "PENDING" | "CONFIRMED" | "WITHDRAWN";
  createdAt: string;
};

export default function WithdrawPage() {
  const { data, loading, error, refresh } = useCachedFetch<Deposit[]>(
    "/api/v1/investor/deposits?status=CONFIRMED"
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const confirmedDeposits = data ?? [];
  const totalWithdrawable = confirmedDeposits.reduce((s, d) => s + d.amount, 0);

  async function confirmWithdraw() {
    if (!selectedId) return;
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await api.post<Deposit>(`/api/v1/investor/withdraw/${selectedId}`, {});
      if (!res.success) throw new Error(res.message ?? "Withdrawal failed");
      setStep("done");
      refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred");
      setStep("error");
    }
  }

  function reset() {
    setStep("form");
    setSelectedId(null);
    setErrorMsg(null);
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Withdraw / Redeem</h1>
        <p className="text-stone-500 text-sm mt-1">Redeem your confirmed liquidity deposits.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {step === "form" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
            <p className="text-xs text-stone-500">Total withdrawable</p>
            {loading ? (
              <div className="h-7 w-28 bg-stone-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold font-mono mt-0.5">{totalWithdrawable.toFixed(6)} ETH</p>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && confirmedDeposits.length === 0 && (
            <div className="text-center py-6 text-stone-400 text-sm">
              No confirmed deposits available to withdraw.
              <br />
              <span className="text-xs">Deposits must be confirmed on-chain before withdrawal.</span>
            </div>
          )}

          {confirmedDeposits.length > 0 && (
            <div>
              <label className="text-sm font-medium text-stone-700 mb-2 block">Select deposit to withdraw</label>
              <div className="space-y-2">
                {confirmedDeposits.map((d) => (
                  <label
                    key={d.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      selectedId === d.id
                        ? "border-[#E85C1A] bg-[#FFF5F0]"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deposit"
                      value={d.id}
                      checked={selectedId === d.id}
                      onChange={() => setSelectedId(d.id)}
                      className="accent-[#E85C1A]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-sm">{d.amount.toFixed(6)} ETH</p>
                      <p className="text-xs text-stone-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <Fuel className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-stone-800">Gas fee estimate</p>
              <p className="font-mono text-xs mt-0.5">~0.00048 ETH</p>
              <p className="text-xs text-stone-500 mt-1">Actual cost depends on network conditions.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={confirmWithdraw}
            disabled={!selectedId || confirmedDeposits.length === 0}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm withdrawal
          </button>
        </div>
      )}

      {step === "submitting" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#E85C1A] mx-auto" />
          <p className="font-medium text-stone-900">Processing withdrawal…</p>
        </div>
      )}

      {step === "done" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="font-medium text-stone-900">Withdrawal complete</p>
          <p className="text-sm text-stone-500">
            Your deposit has been withdrawn from the pool. Funds will appear in your wallet.
          </p>
          <button type="button" onClick={reset} className="text-sm font-medium text-[#E85C1A]">
            Withdraw another deposit
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm space-y-3">
          <p className="font-semibold text-red-700">Withdrawal failed</p>
          <p className="text-sm text-red-600">{errorMsg}</p>
          <button type="button" onClick={reset} className="text-sm font-medium text-[#E85C1A]">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

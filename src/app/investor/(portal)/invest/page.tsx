"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useCachedFetch } from "@/lib/use-cached-fetch";

// ETH is the only supported token — the pool is ETH-denominated
const TOKEN = { id: "ETH", label: "ETH" };
const PLATFORM_FEE_PCT = 10;

type PoolStats = {
  tvl: number;
  apy: number;
};

export default function InvestPage() {
  const { data: pool } = useCachedFetch<PoolStats>("/api/v1/investor/pool");

  const [txHash, setTxHash] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "submitting" | "done" | "error">("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);

  const num = parseFloat(amount.replace(/,/g, "")) || 0;
  const poolTotal = pool?.tvl ?? 0;
  const apy = pool?.apy ?? 0.05;

  const sharePct = useMemo(() => (num > 0 ? (num / (poolTotal + num)) * 100 : 0), [num, poolTotal]);
  const grossYear = num * apy;
  const netYear = grossYear * (1 - PLATFORM_FEE_PCT / 100);

  function canSubmit() {
    return num > 0 && /^0x[a-fA-F0-9]{64}$/.test(txHash);
  }

  function submitForm() {
    if (!canSubmit()) return;
    setStep("confirm");
  }

  async function confirmDeposit() {
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await api.post<{ id: string }>("/api/v1/investor/deposit", {
        txHash,
        amount: num.toString(),
      });
      if (!res.success) throw new Error(res.message ?? "Failed to record deposit");
      setDepositId(res.data?.id ?? null);
      setStep("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred");
      setStep("error");
    }
  }

  function reset() {
    setStep("form");
    setAmount("");
    setTxHash("");
    setErrorMsg(null);
    setDepositId(null);
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Invest / Deposit</h1>
        <p className="text-stone-500 text-sm mt-1">
          Record your on-chain deposit to the liquidity pool. Complete the blockchain transfer first,
          then submit your transaction hash here.
        </p>
      </div>

      {step === "form" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 text-sm">
            <p className="text-stone-500 text-xs mb-1">Token</p>
            <p className="font-semibold">{TOKEN.label}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Amount deposited (ETH)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Transaction hash</label>
            <input
              type="text"
              placeholder="0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-mono"
            />
            {txHash && !/^0x[a-fA-F0-9]{64}$/.test(txHash) && (
              <p className="text-xs text-red-600 mt-1">Invalid transaction hash (must be 0x + 64 hex chars).</p>
            )}
            <p className="text-xs text-stone-400 mt-1">
              Send ETH to the pool contract on Sepolia, then paste the tx hash here.
            </p>
          </div>

          {num > 0 && (
            <div className="rounded-xl border border-stone-100 bg-[#FFF5F0] px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Estimated pool share</span>
                <span className="font-semibold">{sharePct.toFixed(4)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Expected yield (est. APY {(apy * 100).toFixed(1)}%)</span>
                <span className="font-semibold text-emerald-700">~{netYear.toFixed(6)} ETH/yr net</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 text-xs text-stone-600">
            <Info className="h-4 w-4 shrink-0 text-[#E85C1A]" />
            <p>
              <strong className="text-stone-800">Platform fee ({PLATFORM_FEE_PCT}%)</strong> applies to interest revenue
              before distribution. Your principal is not charged.
            </p>
          </div>

          <button
            type="button"
            onClick={submitForm}
            disabled={!canSubmit()}
            className="w-full py-3 rounded-xl bg-[#E85C1A] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to confirmation
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-stone-900">Confirm deposit</h2>
          <ul className="text-sm space-y-2 text-stone-600">
            <li className="flex justify-between">
              <span>Amount</span>
              <span className="font-mono font-medium">{num} ETH</span>
            </li>
            <li className="flex justify-between">
              <span>Est. pool share</span>
              <span>{sharePct.toFixed(4)}%</span>
            </li>
            <li className="flex justify-between">
              <span>Tx hash</span>
              <span className="font-mono text-xs text-stone-500">{txHash.slice(0, 14)}…</span>
            </li>
            <li className="flex justify-between">
              <span>Fee model</span>
              <span>{PLATFORM_FEE_PCT}% on yield only</span>
            </li>
          </ul>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-medium">
              Back
            </button>
            <button type="button" onClick={confirmDeposit} className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold">
              Record deposit
            </button>
          </div>
        </div>
      )}

      {step === "submitting" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#E85C1A] mx-auto" />
          <p className="font-medium text-stone-900">Recording deposit…</p>
          <p className="text-sm text-stone-500">Submitting to Avelon backend.</p>
        </div>
      )}

      {step === "done" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="font-medium text-stone-900">Deposit recorded</p>
          <p className="text-sm text-stone-500">
            Your deposit is pending on-chain confirmation. It will appear as confirmed once the transaction is verified.
          </p>
          {depositId && (
            <p className="text-xs text-stone-400 font-mono">Deposit ID: {depositId}</p>
          )}
          <button type="button" onClick={reset} className="text-sm font-medium text-[#E85C1A]">
            Record another deposit
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm space-y-3">
          <p className="font-semibold text-red-700">Failed to record deposit</p>
          <p className="text-sm text-red-600">{errorMsg}</p>
          <button type="button" onClick={() => setStep("confirm")} className="text-sm font-medium text-[#E85C1A]">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

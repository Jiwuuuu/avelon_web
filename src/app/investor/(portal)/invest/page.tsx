"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2 } from "lucide-react";

const TOKENS = [
  { id: "USDC", label: "USDC", balance: 12450.22 },
  { id: "ETH", label: "ETH", balance: 4.2 },
  { id: "USDT", label: "USDT", balance: 3200 },
];

const POOL_TOTAL = 1_820_000;
const PLATFORM_FEE_PCT = 10;
const EST_APY = 8.2;

export default function InvestPage() {
  const [token, setToken] = useState(TOKENS[0].id);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "pending" | "done">("form");

  const t = TOKENS.find((x) => x.id === token)!;
  const num = parseFloat(amount.replace(/,/g, "")) || 0;
  const sharePct = useMemo(() => (num > 0 ? (num / (POOL_TOTAL + num)) * 100 : 0), [num]);
  const grossYear = num * (EST_APY / 100);
  const netYear = grossYear * (1 - PLATFORM_FEE_PCT / 100);

  function submit() {
    if (num <= 0 || num > t.balance) return;
    setStep("confirm");
  }

  function confirmTx() {
    setStep("pending");
    setTimeout(() => setStep("done"), 2200);
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Invest / Deposit</h1>
        <p className="text-stone-500 text-sm mt-1">Supply liquidity to the pool. Connect your wallet in production to broadcast.</p>
      </div>

      {step === "form" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div>
            <label className="text-sm font-medium text-stone-700">Token</label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm bg-white"
            >
              {TOKENS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-stone-50 border border-stone-100 px-4 py-3 flex justify-between text-sm">
            <span className="text-stone-500">Wallet balance</span>
            <span className="font-semibold font-mono">
              {t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {t.id}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Amount</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-mono"
            />
            {num > t.balance && <p className="text-xs text-red-600 mt-1">Exceeds wallet balance.</p>}
          </div>

          <div className="rounded-xl border border-stone-100 bg-[#FFF5F0] px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Estimated pool share</span>
              <span className="font-semibold">{sharePct.toFixed(4)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Expected earnings (est. APY {EST_APY}%)</span>
              <span className="font-semibold text-emerald-700">~{netYear.toFixed(2)} {t.id}/yr net</span>
            </div>
          </div>

          <div className="flex gap-2 text-xs text-stone-600">
            <Info className="h-4 w-4 shrink-0 text-[#E85C1A]" />
            <p>
              <strong className="text-stone-800">Platform fee ({PLATFORM_FEE_PCT}%)</strong> applies to interest revenue before
              distribution to liquidity providers. Your principal deposit is not charged this fee.
            </p>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={num <= 0 || num > t.balance}
            className="w-full py-3 rounded-xl bg-[#E85C1A] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to confirmation
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-stone-900">Transaction confirmation</h2>
          <ul className="text-sm space-y-2 text-stone-600">
            <li className="flex justify-between">
              <span>Deposit</span>
              <span className="font-mono font-medium">
                {num} {t.id}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Est. pool share</span>
              <span>{sharePct.toFixed(4)}%</span>
            </li>
            <li className="flex justify-between">
              <span>Fee model</span>
              <span>{PLATFORM_FEE_PCT}% on yield</span>
            </li>
          </ul>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-medium">
              Back
            </button>
            <button type="button" onClick={confirmTx} className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold">
              Confirm in wallet
            </button>
          </div>
        </div>
      )}

      {step === "pending" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#E85C1A] mx-auto" />
          <p className="font-medium text-stone-900">Blockchain transaction status</p>
          <p className="text-sm text-stone-500">Waiting for network confirmation…</p>
        </div>
      )}

      {step === "done" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="font-medium text-stone-900">Deposit submitted</p>
          <p className="text-sm text-stone-500 font-mono">Tx: 0x7e2…4f91 (mock)</p>
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setAmount("");
            }}
            className="text-sm font-medium text-[#E85C1A]"
          >
            Make another deposit
          </button>
        </div>
      )}
    </div>
  );
}

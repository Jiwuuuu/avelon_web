"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { useAccount, useBalance, useChainId, useSwitchChain, useSendTransaction } from "wagmi";
import { formatEther, parseEther } from "viem";
import { sepolia } from "wagmi/chains";
import { useAppKit } from "@reown/appkit/react";

// ETH is the only supported token — the pool is ETH-denominated
const TOKEN = { id: "ETH", label: "ETH" };
const PLATFORM_FEE_PCT = 10;

type PoolStats = {
  tvl: number;
  apy: number;
  depositAddress?: string;
};

export default function InvestPage() {
  const { data: pool } = useCachedFetch<PoolStats>("/api/v1/investor/pool");

  // WalletConnect state
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { open: openAppKit } = useAppKit();
  const { data: walletBalance } = useBalance({
      address,
      query: { enabled: isConnected },
  });

  const [txHash, setTxHash] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "submitting" | "done" | "error">("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [mode, setMode] = useState<"wallet" | "manual">("wallet");

  const num = parseFloat(amount.replace(/,/g, "")) || 0;
  const poolTotal = pool?.tvl ?? 0;
  const apy = pool?.apy ?? 0.05;

  const sharePct = useMemo(() => (num > 0 ? (num / (poolTotal + num)) * 100 : 0), [num, poolTotal]);
  const grossYear = num * apy;
  const netYear = grossYear * (1 - PLATFORM_FEE_PCT / 100);

  function canSubmitManual() {
    return num > 0 && /^0x[a-fA-F0-9]{64}$/.test(txHash);
  }

  function canSubmitWallet() {
    return num > 0 && isConnected;
  }

  function submitForm() {
    if (mode === "manual" && !canSubmitManual()) return;
    if (mode === "wallet" && !canSubmitWallet()) return;
    setStep("confirm");
  }

  async function confirmDeposit() {
    setStep("submitting");
    setErrorMsg(null);

    try {
      let finalTxHash = txHash;

      // If using WalletConnect, send the transaction from the wallet
      if (mode === "wallet") {
        // Ensure Sepolia
        if (chainId !== sepolia.id) {
          await switchChainAsync({ chainId: sepolia.id });
        }

        // Send ETH to the pool/deposit address
        const depositAddr = pool?.depositAddress;
        if (!depositAddr) {
          throw new Error("Pool deposit address not available. Please use manual mode.");
        }

        finalTxHash = await sendTransactionAsync({
          to: depositAddr as `0x${string}`,
          value: parseEther(num.toString()),
        });
      }

      const res = await api.post<{ id: string }>("/api/v1/investor/deposit", {
        txHash: finalTxHash,
        amount: num.toString(),
      });
      if (!res.success) throw new Error(res.message ?? "Failed to record deposit");
      setDepositId(res.data?.id ?? null);
      setTxHash(finalTxHash);
      setStep("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      // Handle user rejection
      if (message.includes("User rejected") || message.includes("user rejected")) {
        setErrorMsg("Transaction was rejected in your wallet.");
      } else if (message.includes("insufficient funds")) {
        setErrorMsg("Insufficient ETH balance for this deposit.");
      } else {
        setErrorMsg(message);
      }
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
          Deposit ETH to the liquidity pool. Connect your wallet for a seamless experience,
          or submit a transaction hash manually.
        </p>
      </div>

      {/* Wallet Connection Banner */}
      {step === "form" && (
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
          {isConnected ? (
            <>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-stone-600">
                Connected: <span className="font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                {walletBalance && (
                  <span className="ml-2 font-mono text-xs text-emerald-700">
                    {parseFloat(formatEther(walletBalance.value)).toFixed(4)} {walletBalance.symbol}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => openAppKit()}
                className="ml-auto text-xs font-medium text-[#E85C1A]"
              >
                Switch
              </button>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 text-stone-400" />
              <span className="text-sm text-stone-500">No wallet connected</span>
              <button
                type="button"
                onClick={() => openAppKit()}
                className="ml-auto rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Connect Wallet
              </button>
            </>
          )}
        </div>
      )}

      {step === "form" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          {/* Mode Toggle */}
          <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setMode("wallet")}
              className={`flex-1 py-2.5 font-medium transition-colors ${
                mode === "wallet"
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              Via Wallet
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex-1 py-2.5 font-medium transition-colors ${
                mode === "manual"
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              Paste Tx Hash
            </button>
          </div>

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

          {/* Manual mode: tx hash input */}
          {mode === "manual" && (
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
          )}

          {/* Wallet mode: info message */}
          {mode === "wallet" && !isConnected && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Connect your wallet above to deposit directly.
            </div>
          )}

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
            disabled={mode === "manual" ? !canSubmitManual() : !canSubmitWallet()}
            className="w-full py-3 rounded-xl bg-[#E85C1A] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === "wallet" ? "Deposit via Wallet" : "Continue to confirmation"}
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
            {mode === "manual" && (
              <li className="flex justify-between">
                <span>Tx hash</span>
                <span className="font-mono text-xs text-stone-500">{txHash.slice(0, 14)}…</span>
              </li>
            )}
            {mode === "wallet" && (
              <li className="flex justify-between">
                <span>Method</span>
                <span className="text-emerald-700 font-medium">WalletConnect</span>
              </li>
            )}
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
              {mode === "wallet" ? "Sign & Deposit" : "Record deposit"}
            </button>
          </div>
        </div>
      )}

      {step === "submitting" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 shadow-sm text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#E85C1A] mx-auto" />
          <p className="font-medium text-stone-900">
            {mode === "wallet" ? "Confirm in your wallet…" : "Recording deposit…"}
          </p>
          <p className="text-sm text-stone-500">
            {mode === "wallet"
              ? "Approve the transaction in your wallet app."
              : "Submitting to Avelon backend."}
          </p>
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
          {txHash && (
            <p className="text-xs text-stone-400 font-mono">Tx: {txHash.slice(0, 14)}…{txHash.slice(-6)}</p>
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

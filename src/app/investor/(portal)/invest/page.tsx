"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { ConnectNotice, StatusBanner, usePoolAction } from "@/components/investor/PoolAction";
import { CHAIN_NAME } from "@/config/chain";

type PoolStats = {
    tvl: number;
    availableLiquidity: number;
    totalBorrowed: number;
    utilizationRate: number;
    apy: number;
    totalInvestors: number;
    activeLoans: number;
    poolAddress: string | null;
    custodyMode: string;
    depositsEnabled: boolean;
};

type Position = {
    currentValue: number;
    totalDeposited: number;
    totalYieldEarned: number;
    shares: number;
};

export default function InvestPage() {
    const { data: pool, loading, error, refresh } = useCachedFetch<PoolStats>("/api/v1/investor/pool");
    const { data: position, refresh: refreshPosition } = useCachedFetch<Position>("/api/v1/investor/position");
    const { status, run, isConnected } = usePoolAction();
    const [amount, setAmount] = useState("");

    const busy = status.kind === "working";
    const parsed = Number(amount);
    const valid = amount.trim() !== "" && Number.isFinite(parsed) && parsed > 0;

    const deposit = async () => {
        await run({
            action: "deposit",
            amountEth: amount,
            recordPath: "/api/v1/investor/deposit",
            successMessage: `Deposited ${amount} ETH into the pool.`,
        });
        setAmount("");
        refresh();
        refreshPosition();
    };

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Invest in the lending pool</h1>
                <p className="mt-1 text-sm text-stone-500">
                    Deposit ETH and receive shares in the pool that funds Avelon loans.
                </p>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
                <div>
                    <p className="font-semibold text-stone-900">How your money earns</p>
                    <p className="mt-1">
                        Your shares are worth a slice of everything the pool holds — idle ETH plus principal out with
                        borrowers. When a borrower repays, the interest stays in the pool and every share becomes worth
                        more. If a borrower defaults, the loss is shared the same way. Nothing is guaranteed, and this
                        is a capstone prototype running on {CHAIN_NAME}.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-stone-900">Pool right now</h2>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <Stat label="Total value" value={loading ? null : `${(pool?.tvl ?? 0).toFixed(4)} ETH`} />
                    <Stat
                        label="Available to lend"
                        value={loading ? null : `${(pool?.availableLiquidity ?? 0).toFixed(4)} ETH`}
                    />
                    <Stat label="Out with borrowers" value={loading ? null : `${(pool?.totalBorrowed ?? 0).toFixed(4)} ETH`} />
                    <Stat
                        label="Interest earned to date"
                        value={loading ? null : `${((pool?.apy ?? 0) * 100).toFixed(2)}% of pool`}
                        hint="Realised, not a forecast"
                    />
                </dl>
                {pool?.poolAddress && (
                    <p className="mt-4 break-all font-mono text-xs text-stone-400">Pool: {pool.poolAddress}</p>
                )}
            </div>

            {position && position.currentValue > 0 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold text-stone-900">Your position</h2>
                    <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <Stat label="Current value" value={`${position.currentValue.toFixed(6)} ETH`} />
                        <Stat label="You deposited" value={`${position.totalDeposited.toFixed(6)} ETH`} />
                        <Stat label="Yield earned" value={`${position.totalYieldEarned.toFixed(6)} ETH`} />
                        <Stat label="Shares held" value={position.shares.toFixed(6)} />
                    </dl>
                </div>
            )}

            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-stone-900">Deposit</h2>
                <ConnectNotice isConnected={isConnected} />

                <label className="block text-sm">
                    <span className="text-stone-600">Amount in ETH</span>
                    <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1.0"
                        disabled={busy}
                        className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 font-mono focus:border-stone-900 focus:outline-none disabled:bg-stone-100"
                    />
                </label>

                <StatusBanner status={status} />

                <button
                    type="button"
                    onClick={deposit}
                    disabled={!isConnected || !valid || busy}
                    className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
                >
                    {busy ? "Working…" : "Deposit into pool"}
                </button>
            </div>
        </div>
    );
}

function Stat({ label, value, hint }: { label: string; value: string | null; hint?: string }) {
    return (
        <div className="rounded-xl bg-stone-50 p-4">
            <dt className="text-stone-500">{label}</dt>
            <dd className="mt-1 font-mono font-semibold">{value ?? "Loading…"}</dd>
            {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
        </div>
    );
}

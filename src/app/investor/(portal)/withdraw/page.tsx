"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { ConnectNotice, StatusBanner, usePoolAction } from "@/components/investor/PoolAction";

type Position = {
    shares: number;
    currentValue: number;
    totalDeposited: number;
    totalYieldEarned: number;
    claimableYield: number;
    maxWithdrawable: number;
};

export default function WithdrawPage() {
    const { data: position, loading, error, refresh } = useCachedFetch<Position>("/api/v1/investor/position");
    const { status, run, isConnected } = usePoolAction();
    const [shares, setShares] = useState("");

    const busy = status.kind === "working";
    const held = position?.shares ?? 0;
    const parsed = Number(shares);
    const valid = shares.trim() !== "" && Number.isFinite(parsed) && parsed > 0 && parsed <= held;

    // Everything the investor owns may not be payable right now: the pool only has
    // its idle ETH to hand out, the rest is with borrowers until they repay.
    const shortOfLiquidity =
        !!position && position.maxWithdrawable < position.currentValue - 1e-12;

    const withdraw = async () => {
        await run({
            action: "withdraw",
            shares,
            recordPath: "/api/v1/investor/withdraw",
            successMessage: "Withdrawal complete.",
        });
        setShares("");
        refresh();
    };

    const claim = async () => {
        await run({
            action: "claim",
            recordPath: "/api/v1/investor/claim-yield",
            successMessage: "Yield claimed. Your deposited principal stays invested.",
        });
        refresh();
    };

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Withdraw or claim</h1>
                <p className="mt-1 text-sm text-stone-500">
                    Redeem shares for ETH, or take just the yield and leave your principal working.
                </p>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-stone-900">Your position</h2>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <Stat label="Current value" value={loading ? null : `${(position?.currentValue ?? 0).toFixed(6)} ETH`} />
                    <Stat label="Shares held" value={loading ? null : (position?.shares ?? 0).toFixed(6)} />
                    <Stat label="Yield available" value={loading ? null : `${(position?.claimableYield ?? 0).toFixed(6)} ETH`} />
                    <Stat
                        label="Withdrawable now"
                        value={loading ? null : `${(position?.maxWithdrawable ?? 0).toFixed(6)} ETH`}
                    />
                </dl>
            </div>

            {shortOfLiquidity && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
                    <Info className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-semibold">Part of your position is lent out</p>
                        <p className="mt-1">
                            The pool can pay {(position?.maxWithdrawable ?? 0).toFixed(6)} ETH right now. The rest is
                            with borrowers and becomes available as they repay. There is no queue — withdrawals are
                            first come, first served against idle ETH.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-stone-900">Claim yield only</h2>
                <p className="text-sm text-stone-600">
                    Takes out what you have earned above your deposit and leaves the deposit invested. Doing nothing
                    compounds it instead — unclaimed yield is already inside your shares.
                </p>
                <ConnectNotice isConnected={isConnected} />
                <button
                    type="button"
                    onClick={claim}
                    disabled={!isConnected || busy || (position?.claimableYield ?? 0) <= 0}
                    className="w-full rounded-xl border border-stone-900 py-3 text-sm font-semibold text-stone-900 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                >
                    {(position?.claimableYield ?? 0) > 0
                        ? `Claim ${(position?.claimableYield ?? 0).toFixed(6)} ETH`
                        : "No yield to claim yet"}
                </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-stone-900">Redeem shares</h2>

                <label className="block text-sm">
                    <span className="text-stone-600">Shares to redeem</span>
                    <input
                        type="number"
                        min="0"
                        step="0.000001"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder={held.toFixed(6)}
                        disabled={busy}
                        className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 font-mono focus:border-stone-900 focus:outline-none disabled:bg-stone-100"
                    />
                </label>
                <button
                    type="button"
                    onClick={() => setShares(String(held))}
                    disabled={busy || held <= 0}
                    className="text-xs font-medium text-stone-500 underline disabled:no-underline disabled:opacity-50"
                >
                    Use my full balance
                </button>

                {shares.trim() !== "" && parsed > held && (
                    <p className="text-sm text-red-600">You only hold {held.toFixed(6)} shares.</p>
                )}

                <StatusBanner status={status} />

                <button
                    type="button"
                    onClick={withdraw}
                    disabled={!isConnected || !valid || busy}
                    className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
                >
                    {busy ? "Working…" : "Withdraw"}
                </button>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="rounded-xl bg-stone-50 p-4">
            <dt className="text-stone-500">{label}</dt>
            <dd className="mt-1 font-mono font-semibold">{value ?? "Loading…"}</dd>
        </div>
    );
}

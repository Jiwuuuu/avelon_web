"use client";

import { Info } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { PendingNotice, StatusBanner, usePoolAction, WalletNotice } from "@/components/investor/PoolAction";

type EarningsData = {
  totalEarned: number;
  claimable: number;
  monthlyBreakdown: { month: string; earned: number }[];
};

export default function EarningsPage() {
  const { data, loading, error, refresh } = useCachedFetch<EarningsData>("/api/v1/investor/earnings");
  const { status, run, ready, wallet, pending, retryPending } = usePoolAction();

  const total = data?.totalEarned ?? 0;
  const claimable = data?.claimable ?? 0;
  const monthly = data?.monthlyBreakdown ?? [];
  const busy = status.kind === "working";

  const claim = async () => {
    await run({
      action: "claim",
      recordPath: "/api/v1/investor/claim-yield",
      successMessage: "Yield claimed. Your deposited principal stays invested.",
    });
    refresh();
  };

  // Chart: use monthly data or empty bars
  const bars = monthly.length > 0 ? monthly.map((m) => m.earned) : [];
  const maxBar = bars.length > 0 ? Math.max(...bars) : 1;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Earnings and returns</h1>
        <p className="text-stone-500 text-sm mt-1">What your shares have earned from borrowers' interest, read from the pool contract.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <p className="text-sm text-stone-500">Total yield earned</p>
          {loading ? (
            <div className="h-10 w-36 bg-stone-100 rounded animate-pulse mt-1" />
          ) : (
            <>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{total.toFixed(6)} ETH</p>
              <p className="text-xs text-stone-500 mt-2">
                Claimable: <span className="font-semibold text-stone-700">{claimable.toFixed(6)} ETH</span>
              </p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-[#E85C1A]" />
            <p className="text-sm font-semibold text-stone-800">Where the yield comes from</p>
          </div>
          <ul className="text-sm space-y-2 text-stone-600 list-disc pl-5">
            <li>Borrowers repay principal plus interest into the pool.</li>
            <li>All of that interest, and every origination fee, stays in the pool and raises what each share is worth. Avelon takes no platform fee in this prototype.</li>
            <li>A loan that defaults lowers every share; the borrower&apos;s seized stake goes back into the pool.</li>
          </ul>
        </div>
      </div>

      {monthly.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900 mb-4">Monthly earnings</h2>
          <div className="flex items-end gap-1 h-32">
            {bars.map((h, i) => (
              <div
                key={monthly[i].month}
                className="flex-1 rounded-t bg-[#E85C1A]/80"
                style={{ height: `${maxBar > 0 ? (h / maxBar) * 100 : 0}%`, minHeight: "4px" }}
                title={`${monthly[i].month}: ${h.toFixed(6)} ETH`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 mt-2">
            <span>{monthly[0]?.month}</span>
            <span>{monthly[monthly.length - 1]?.month}</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">Monthly net yield to investor (ETH)</p>
        </section>
      )}

      {monthly.length === 0 && !loading && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm text-center text-stone-400 text-sm">
          No earnings history yet. Yield is distributed when borrowers repay loans.
        </section>
      )}

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-stone-900">Claim your yield</h2>
          <p className="text-sm text-stone-500 mt-1">
            Takes only the gain and leaves your deposit invested. Unclaimed yield keeps compounding inside your shares.
          </p>
        </div>
        <WalletNotice wallet={wallet} onLinked={refresh} />
        <PendingNotice pending={pending} onRetry={retryPending} busy={busy} />
        <StatusBanner status={status} />
        <button
          type="button"
          onClick={claim}
          disabled={!ready || busy || claimable <= 0}
          className="px-6 py-3 rounded-xl bg-[#E85C1A] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Waiting for your wallet…" : claimable > 0 ? `Claim ${claimable.toFixed(6)} ETH` : "Nothing to claim yet"}
        </button>
      </section>
    </div>
  );
}

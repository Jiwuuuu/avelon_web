"use client";

import { useState } from "react";
import { useAccount, useChainId, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import { AlertTriangle, Loader2, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { appChain, CHAIN_NAME } from "@/config/chain";

type CallData = { to: `0x${string}`; data: `0x${string}`; value: string; chainId: number };

type Status =
    | { kind: "idle" }
    | { kind: "working"; step: string }
    | { kind: "done"; txHash: string; message: string }
    | { kind: "error"; message: string };

/**
 * Runs one pool action end to end: fetch the calldata from the backend, have the
 * investor's own wallet sign and send it, then hand the hash back so the backend
 * can verify it against the pool's event and file it.
 *
 * The backend never signs any of this. It only reads the resulting transaction,
 * which is why a wallet is mandatory rather than a convenience.
 */
export function usePoolAction() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const [status, setStatus] = useState<Status>({ kind: "idle" });

    const run = async (opts: {
        action: "deposit" | "withdraw" | "claim";
        /** Shares to redeem — withdraw only. */
        shares?: string;
        /** ETH to send — deposit only. */
        amountEth?: string;
        recordPath: string;
        successMessage: string;
    }) => {
        if (!isConnected || !address) {
            setStatus({ kind: "error", message: "Connect a wallet first." });
            return;
        }

        try {
            if (chainId !== appChain.id) {
                setStatus({ kind: "working", step: `Switching to ${CHAIN_NAME}…` });
                await switchChainAsync({ chainId: appChain.id });
            }

            setStatus({ kind: "working", step: "Preparing transaction…" });
            const query = opts.shares ? `&shares=${encodeURIComponent(opts.shares)}` : "";
            const prepared = await api.get<CallData>(
                `/api/v1/investor/calldata?action=${opts.action}${query}`,
            );
            if (!prepared.success || !prepared.data) {
                throw new Error(prepared.error ?? "Could not prepare the transaction.");
            }

            setStatus({ kind: "working", step: "Waiting for your wallet…" });
            const txHash = await sendTransactionAsync({
                to: prepared.data.to,
                data: prepared.data.data,
                value: opts.amountEth ? parseEther(opts.amountEth) : undefined,
            });

            // The backend reads the amount and shares off the pool's own event, so
            // there is nothing to send here but the hash.
            setStatus({ kind: "working", step: "Recording on Avelon…" });
            const recorded = await api.post<unknown>(opts.recordPath, { txHash });
            if (!recorded.success) {
                throw new Error(
                    recorded.error ??
                        "The transaction went through but Avelon could not record it. Keep this hash: " + txHash,
                );
            }

            setStatus({ kind: "done", txHash, message: opts.successMessage });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Transaction failed.";
            // Wallet rejections are a normal outcome, not a fault worth alarming about.
            setStatus({
                kind: "error",
                message: /user rejected|denied/i.test(message) ? "You cancelled the transaction." : message,
            });
        }
    };

    return { status, setStatus, run, address, isConnected };
}

export function StatusBanner({ status }: { status: Status }) {
    if (status.kind === "idle") return null;

    if (status.kind === "working") {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                {status.step}
            </div>
        );
    }

    if (status.kind === "done") {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">{status.message}</p>
                <p className="mt-1 font-mono text-xs break-all">{status.txHash}</p>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{status.message}</span>
        </div>
    );
}

export function ConnectNotice({ isConnected }: { isConnected: boolean }) {
    if (isConnected) return null;
    return (
        <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
                Connect a wallet on {CHAIN_NAME} to continue. Avelon holds no investor keys, so every deposit,
                withdrawal and yield claim is signed by you.
            </span>
        </div>
    );
}

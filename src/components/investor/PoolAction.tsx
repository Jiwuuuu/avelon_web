"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useConfig, useSendTransaction, useSignMessage, useSwitchChain } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { parseEther } from "viem";
import { useAppKit } from "@reown/appkit/react";
import { AlertTriangle, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-errors";
import { recordWithRetry } from "@/lib/record-with-retry";
import { appChain, CHAIN_NAME } from "@/config/chain";

// A sent transaction the backend has not filed yet, kept across reloads
type PendingPoolTx = { txHash: string; recordPath: string; successMessage: string };
const PENDING_KEY = "avelon:pending-pool-tx";

function readPending(): PendingPoolTx | null {
    try {
        const raw = window.localStorage.getItem(PENDING_KEY);
        return raw ? (JSON.parse(raw) as PendingPoolTx) : null;
    } catch {
        return null;
    }
}

function writePending(value: PendingPoolTx | null) {
    try {
        if (value) window.localStorage.setItem(PENDING_KEY, JSON.stringify(value));
        else window.localStorage.removeItem(PENDING_KEY);
    } catch {
        // Storage can be unavailable; the hash is still shown on screen
    }
}

type CallData = { to: `0x${string}`; data: `0x${string}`; value: string; chainId: number };

type LinkedWallet = { address: string; chainId: number; isVerified: boolean };

// The backend only credits pool transactions from a wallet linked to the account,
// so linking comes first: one signed message, free, nothing sent.
export function useWalletLink() {
    const { address, isConnected } = useAccount();
    const { open } = useAppKit();
    const { signMessageAsync } = useSignMessage();
    const [linked, setLinked] = useState<string[] | null>(null);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await api.get<LinkedWallet[]>("/api/v1/wallets");
        setLinked(
            res.success && res.data
                ? res.data.filter((w) => w.isVerified && w.chainId === appChain.id).map((w) => w.address.toLowerCase())
                : [],
        );
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const isLinked = !!address && !!linked?.includes(address.toLowerCase());

    const link = async (): Promise<boolean> => {
        if (!address) return false;
        setLinking(true);
        setError(null);
        try {
            const lower = address.toLowerCase();
            const challenge = await api.post<{ message: string }>("/api/v1/wallets/connect", {
                address: lower,
                chainId: appChain.id,
            });
            if (!challenge.success || !challenge.data) {
                throw new Error(errorMessage(challenge, "Could not start linking this wallet."));
            }
            const signature = await signMessageAsync({ message: challenge.data.message });
            const verified = await api.post<unknown>("/api/v1/wallets/verify", {
                address: lower,
                chainId: appChain.id,
                signature,
                message: challenge.data.message,
            });
            if (!verified.success) {
                throw new Error(errorMessage(verified, "Could not link this wallet."));
            }
            await load();
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Could not link this wallet.";
            setError(/user rejected|denied/i.test(message) ? "You cancelled the signature." : message);
            return false;
        } finally {
            setLinking(false);
        }
    };

    return { address, isConnected, isLinked, checking: linked === null, linking, error, link, open: () => open() };
}

export type WalletLink = ReturnType<typeof useWalletLink>;

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
    const wallet = useWalletLink();
    const { address, isConnected, isLinked } = wallet;
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const config = useConfig();
    const [status, setStatus] = useState<Status>({ kind: "idle" });
    const [pending, setPending] = useState<PendingPoolTx | null>(null);

    useEffect(() => {
        setPending(readPending());
    }, []);

    /** File a sent transaction, waiting for it to confirm and retrying "not yet" answers. */
    const file = async (tx: PendingPoolTx) => {
        setStatus({ kind: "working", step: "Waiting for the transaction to confirm…" });
        try {
            await waitForTransactionReceipt(config, { hash: tx.txHash as `0x${string}`, chainId: appChain.id, timeout: 120_000 });
        } catch {
            // Not fatal; the backend is asked either way
        }

        setStatus({ kind: "working", step: "Recording on Avelon…" });
        const recorded = await recordWithRetry(() => api.post<unknown>(tx.recordPath, { txHash: tx.txHash }));
        const message = errorMessage(recorded, "");
        const alreadyFiled = /already been recorded/i.test(message);

        if (recorded.success || alreadyFiled) {
            writePending(null);
            setPending(null);
            setStatus({ kind: "done", txHash: tx.txHash, message: tx.successMessage });
            return;
        }
        setStatus({
            kind: "error",
            message: `${message || "Avelon could not record the transaction yet."} Your funds are safe; use "Record it again" to retry.`,
        });
    };

    const retryPending = async () => {
        if (pending) await file(pending);
    };

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
        // A transaction from an unlinked wallet would land but never be credited
        if (!isLinked) {
            setStatus({ kind: "error", message: "Link this wallet to your account first." });
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
                throw new Error(errorMessage(prepared, "Could not prepare the transaction."));
            }

            setStatus({ kind: "working", step: "Waiting for your wallet…" });
            const txHash = await sendTransactionAsync({
                to: prepared.data.to,
                data: prepared.data.data,
                value: opts.amountEth ? parseEther(opts.amountEth) : undefined,
            });

            // The backend reads the amount and shares off the pool's own event, so
            // there is nothing to send here but the hash.
            const tx = { txHash, recordPath: opts.recordPath, successMessage: opts.successMessage };
            writePending(tx);
            setPending(tx);
            await file(tx);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Transaction failed.";
            // Wallet rejections are a normal outcome, not a fault worth alarming about.
            setStatus({
                kind: "error",
                message: /user rejected|denied/i.test(message) ? "You cancelled the transaction." : message,
            });
        }
    };

    return { status, setStatus, run, address, isConnected, ready: isConnected && isLinked, wallet, pending, retryPending };
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

export function PendingNotice({
    pending,
    onRetry,
    busy,
}: {
    pending: { txHash: string } | null;
    onRetry: () => void;
    busy: boolean;
}) {
    if (!pending) return null;
    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">A transaction is waiting to be recorded</p>
            <p className="mt-1 font-mono text-xs break-all">{pending.txHash}</p>
            <button
                type="button"
                onClick={onRetry}
                disabled={busy}
                className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
                Record it again
            </button>
        </div>
    );
}

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

// Connect, then link, then a one-line reminder of which wallet signs.
export function WalletNotice({ wallet, onLinked }: { wallet: WalletLink; onLinked?: () => void }) {
    const { address, isConnected, isLinked, checking, linking, error, link, open } = wallet;

    if (!isConnected || !address) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p>
                        Connect a wallet on {CHAIN_NAME} to continue. Avelon holds no investor keys, so every deposit,
                        withdrawal and yield claim is signed by you.
                    </p>
                    <button
                        type="button"
                        onClick={open}
                        className="mt-3 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                        Connect wallet
                    </button>
                </div>
            </div>
        );
    }

    if (checking) return null;

    if (!isLinked) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold">Link {short(address)} to your account</p>
                    <p className="mt-1">
                        Your wallet will ask you to sign a message. It proves the wallet is yours, costs nothing and
                        sends nothing.
                    </p>
                    {error && <p className="mt-2 text-red-700">{error}</p>}
                    <div className="mt-3 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={async () => {
                                if (await link()) onLinked?.();
                            }}
                            disabled={linking}
                            className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                            {linking ? "Waiting for your wallet…" : "Link wallet"}
                        </button>
                        <button type="button" onClick={open} className="text-xs font-medium text-amber-900 underline">
                            Use another wallet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-stone-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
                Signing with <span className="font-mono text-stone-700">{short(address)}</span>
            </span>
            <button type="button" onClick={open} className="ml-auto font-medium text-[#E85C1A]">
                Change
            </button>
        </div>
    );
}

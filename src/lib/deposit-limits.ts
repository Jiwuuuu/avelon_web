import { formatEther, parseEther } from "viem";

// Plain decimal ETH as typed into the form: "1", "1.5" or ".5", at most 18 places.
// The backend accepts exactly the same shapes.
const ETH_AMOUNT = /^(\d+(\.\d{1,18})?|\.\d{1,18})$/;

// Pool limits as the backend reports them: decimal ETH strings, or null when the
// pool predates them.
export type DepositLimits = { minDeposit: string | null; maxDeposit: string | null };

export function normalizeAmount(amount: string): string {
    const typed = amount.trim();
    return typed.startsWith(".") ? `0${typed}` : typed;
}

// The first reason this amount cannot be deposited, or null when it can. Pass the
// wallet balance only when it was actually read: on Vercel the local chain is not
// reachable from a reviewer's browser, and a failed read must not block anyone.
export function depositError(amount: string, limits: DepositLimits, balanceWei?: bigint): string | null {
    const typed = amount.trim();
    if (typed === "") return "Enter an amount.";
    if (!ETH_AMOUNT.test(typed)) return "Enter the amount in ETH, with at most 18 decimal places.";

    // Compared in wei; floating point would let 10.000000000000000001 through
    const wei = parseEther(normalizeAmount(typed));
    if (wei === 0n) return "Enter an amount greater than zero.";
    if (limits.minDeposit && wei < parseEther(limits.minDeposit)) {
        return `Minimum deposit is ${limits.minDeposit} ETH.`;
    }
    if (limits.maxDeposit && wei > parseEther(limits.maxDeposit)) {
        return `Maximum deposit is ${limits.maxDeposit} ETH per transaction.`;
    }
    if (balanceWei !== undefined && wei > balanceWei) {
        const held = Number(formatEther(balanceWei)).toLocaleString(undefined, { maximumFractionDigits: 4 });
        return `This wallet only holds ${held} ETH.`;
    }
    return null;
}

// The pool's deposit-limit errors by selector. The web has no pool ABI, so a revert
// arrives as raw data, possibly nested in the error's cause. The amount is checked
// before signing, so this only fires if the limits change while the page is open.
const POOL_ERRORS: Record<string, string> = {
    "0xed28d089": "That amount is below the pool's minimum deposit.",
    "0xb074571a": "That amount is above the pool's maximum deposit.",
};

export function poolErrorMessage(err: unknown): string | null {
    let current: unknown = err;
    for (let depth = 0; current && depth < 8; depth++) {
        const message = current instanceof Error ? current.message : typeof current === "string" ? current : "";
        const data = typeof current === "object" ? (current as { data?: unknown }).data : undefined;
        const haystack = `${message} ${typeof data === "string" ? data : ""}`.toLowerCase();
        for (const [selector, text] of Object.entries(POOL_ERRORS)) {
            if (haystack.includes(selector)) return text;
        }
        current = typeof current === "object" ? (current as { cause?: unknown }).cause : undefined;
    }
    return null;
}

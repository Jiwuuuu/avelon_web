// Restoring puts back whatever status the user had before the suspension; the
// backend refuses to set KYC or wallet statuses directly.
export function userStatusBody(action: 'suspend' | 'restore') {
    return { status: action === 'suspend' ? 'SUSPENDED' : 'RESTORED' } as const;
}

interface LoanState {
    status: string;
    principalOwed: number | string;
    interestOwed: number | string;
    feesOwed: number | string;
    dueDate: Date | string | null;
}

export type FollowUp = { kind: 'disburse' | 'release-collateral' | 'liquidate' | 'settle'; label: string; confirm?: string };

/** The one admin action a loan is waiting on, if any. */
export function followUpAction(loan: LoanState, now = new Date()): FollowUp | null {
    const owed = Number(loan.principalOwed) + Number(loan.interestOwed) + Number(loan.feesOwed);

    switch (loan.status) {
        case 'COLLATERAL_DEPOSITED':
            return { kind: 'disburse', label: 'Retry payout' };
        case 'ACTIVE':
            if (owed <= 0) return { kind: 'release-collateral', label: 'Release stake' };
            if (loan.dueDate && new Date(loan.dueDate).getTime() < now.getTime()) {
                return {
                    kind: 'liquidate',
                    label: 'Liquidate',
                    confirm: "Seize this borrower's stake for the missed due date? This cannot be undone.",
                };
            }
            return null;
        case 'LIQUIDATED':
            return { kind: 'settle', label: 'Retry settlement' };
        default:
            return null;
    }
}

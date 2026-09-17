import { describe, expect, it } from 'vitest';
import { followUpAction } from '@/lib/admin-actions';

const NOW = new Date('2026-09-17T12:00:00Z');
const owing = { principalOwed: '0.05', interestOwed: '0.0003', feesOwed: '0' };
const paid = { principalOwed: '0', interestOwed: '0', feesOwed: '0' };

describe('followUpAction', () => {
    it('offers a payout retry when the stake is in but no payout went out', () => {
        expect(followUpAction({ status: 'COLLATERAL_DEPOSITED', ...owing, dueDate: null }, NOW)?.kind).toBe('disburse');
    });

    it('offers to release the stake of a paid-off loan', () => {
        expect(followUpAction({ status: 'ACTIVE', ...paid, dueDate: '2026-10-01' }, NOW)?.kind).toBe('release-collateral');
    });

    it('offers liquidation only once an unpaid loan is past due', () => {
        expect(followUpAction({ status: 'ACTIVE', ...owing, dueDate: '2026-09-16T00:00:00Z' }, NOW)?.kind).toBe('liquidate');
        expect(followUpAction({ status: 'ACTIVE', ...owing, dueDate: '2026-09-18T00:00:00Z' }, NOW)).toBeNull();
    });

    it('offers a settlement retry on a liquidated loan', () => {
        expect(followUpAction({ status: 'LIQUIDATED', ...paid, dueDate: null }, NOW)?.kind).toBe('settle');
    });

    it('offers nothing for finished loans', () => {
        for (const status of ['REPAID', 'CANCELLED', 'REJECTED', 'EXPIRED']) {
            expect(followUpAction({ status, ...paid, dueDate: null }, NOW)).toBeNull();
        }
    });
});

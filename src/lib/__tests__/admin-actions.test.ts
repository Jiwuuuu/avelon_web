import { describe, expect, it } from 'vitest';
import { userStatusBody } from '@/lib/admin-actions';

describe('userStatusBody', () => {
    it('suspends', () => {
        expect(userStatusBody('suspend')).toEqual({ status: 'SUSPENDED' });
    });

    it('restores the previous status instead of granting approval', () => {
        expect(userStatusBody('restore')).toEqual({ status: 'RESTORED' });
    });
});

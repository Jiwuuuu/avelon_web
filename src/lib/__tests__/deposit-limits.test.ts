import { describe, expect, it } from 'vitest';
import { depositError, normalizeAmount, poolErrorMessage } from '@/lib/deposit-limits';

const LIMITS = { minDeposit: '0.01', maxDeposit: '10' };
const ETH = 10n ** 18n;

describe('depositError', () => {
    it('accepts amounts inside and exactly at the limits', () => {
        for (const amount of ['0.01', '1', '2.5', '.5', '10']) {
            expect(depositError(amount, LIMITS)).toBeNull();
        }
    });

    it('names the limit that was crossed', () => {
        expect(depositError('0.001', LIMITS)).toBe('Minimum deposit is 0.01 ETH.');
        expect(depositError('10.000000000000000001', LIMITS)).toBe('Maximum deposit is 10 ETH per transaction.');
    });

    it('rejects input that is not plain decimal ETH', () => {
        expect(depositError('', LIMITS)).toBe('Enter an amount.');
        expect(depositError('0', LIMITS)).toBe('Enter an amount greater than zero.');
        for (const amount of ['1e3', '-1', 'abc', '0.0000000000000000001']) {
            expect(depositError(amount, LIMITS)).toMatch(/Enter the amount in ETH/);
        }
    });

    it('checks the wallet balance only when it was read', () => {
        expect(depositError('5', LIMITS, 2n * ETH)).toBe('This wallet only holds 2 ETH.');
        expect(depositError('5', LIMITS, 6n * ETH)).toBeNull();
        expect(depositError('5', LIMITS, undefined)).toBeNull();
    });

    it('skips the bounds when the pool reports none', () => {
        expect(depositError('50', { minDeposit: null, maxDeposit: null })).toBeNull();
    });
});

describe('normalizeAmount', () => {
    it('adds the leading zero a bare decimal needs', () => {
        expect(normalizeAmount('.5')).toBe('0.5');
        expect(normalizeAmount(' 1.5 ')).toBe('1.5');
    });
});

describe('poolErrorMessage', () => {
    it('finds the selector in a nested cause', () => {
        const err = Object.assign(new Error('Execution reverted'), {
            cause: { message: 'reverted with the following signature: 0xed28d089', data: '0xed28d089000000' },
        });
        expect(poolErrorMessage(err)).toBe("That amount is below the pool's minimum deposit.");
    });

    it('finds it in revert data alone', () => {
        expect(poolErrorMessage({ data: '0xB074571A0000' })).toBe("That amount is above the pool's maximum deposit.");
    });

    it('leaves other errors alone', () => {
        expect(poolErrorMessage(new Error('User rejected the request.'))).toBeNull();
        expect(poolErrorMessage(undefined)).toBeNull();
    });
});

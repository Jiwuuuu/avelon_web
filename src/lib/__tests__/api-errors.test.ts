import { describe, expect, it } from 'vitest';
import { errorMessage } from '@/lib/api-errors';

describe('errorMessage', () => {
    it('reads the message out of the backend error object', () => {
        expect(errorMessage({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Could not create the on-chain loan.' } }, 'fallback'))
            .toBe('Could not create the on-chain loan.');
    });

    it('accepts a plain string error', () => {
        expect(errorMessage({ success: false, error: 'Session expired' }, 'fallback')).toBe('Session expired');
    });

    it('falls back to a top-level message', () => {
        expect(errorMessage({ success: false, message: 'Plan not found' }, 'fallback')).toBe('Plan not found');
    });

    it('never produces [object Object]', () => {
        expect(errorMessage({ success: false, error: { code: 'X' } }, 'Could not approve the loan.')).toBe('Could not approve the loan.');
        expect(errorMessage(undefined, 'Could not approve the loan.')).toBe('Could not approve the loan.');
    });
});

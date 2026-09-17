import { describe, expect, it, vi } from 'vitest';
import { recordWithRetry } from '@/lib/record-with-retry';

describe('recordWithRetry', () => {
    it('retries while the transaction is still confirming', async () => {
        const submit = vi.fn()
            .mockResolvedValueOnce({ success: false, error: { message: 'Transaction is not successful or has fewer than 1 confirmation(s)' } })
            .mockResolvedValueOnce({ success: true });
        expect((await recordWithRetry(submit, { attempts: 3, delayMs: 0 })).success).toBe(true);
        expect(submit).toHaveBeenCalledTimes(2);
    });

    it('stops on a real refusal', async () => {
        const submit = vi.fn().mockResolvedValue({ success: false, error: { message: 'This transaction has already been recorded' } });
        await recordWithRetry(submit, { attempts: 3, delayMs: 0 });
        expect(submit).toHaveBeenCalledTimes(1);
    });

    it('retries when the request itself fails', async () => {
        const submit = vi.fn()
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce({ success: true });
        expect((await recordWithRetry(submit, { attempts: 3, delayMs: 0 })).success).toBe(true);
    });
});

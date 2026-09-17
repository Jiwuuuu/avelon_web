import { errorMessage } from './api-errors';

type Result = { success: boolean; error?: unknown; message?: unknown };

// "Not yet" answers: the chain has not confirmed the transaction or the request dropped
const TRANSIENT = [/fewer than \d+ confirmation/i, /lacks \d+ confirmation/i, /failed to fetch/i, /network/i, /backend unavailable/i];

/** Ask the backend to file a transaction until it succeeds or says no. */
export async function recordWithRetry<T extends Result>(
    submit: () => Promise<T>,
    { attempts = 6, delayMs = 3000 }: { attempts?: number; delayMs?: number } = {},
): Promise<T | { success: false; error: string }> {
    let last: T | { success: false; error: string } = { success: false, error: 'Not attempted' };
    for (let attempt = 0; attempt < attempts; attempt++) {
        if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
        try {
            last = await submit();
        } catch (err) {
            last = { success: false, error: err instanceof Error ? err.message : String(err) };
        }
        if (last.success) return last;
        const message = errorMessage(last, '');
        if (!TRANSIENT.some((pattern) => pattern.test(message))) return last;
    }
    return last;
}

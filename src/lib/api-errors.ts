// The backend sends { error: { code, message } }; older routes send a string or
// a top-level message. Passing the object straight to new Error() showed
// "[object Object]" to admins exactly when the reason mattered.
export function errorMessage(response: unknown, fallback: string): string {
    if (!response || typeof response !== 'object') return fallback;
    const { error, message } = response as { error?: unknown; message?: unknown };
    if (typeof error === 'string' && error) return error;
    if (error && typeof error === 'object') {
        const inner = (error as { message?: unknown }).message;
        if (typeof inner === 'string' && inner) return inner;
    }
    if (typeof message === 'string' && message) return message;
    return fallback;
}

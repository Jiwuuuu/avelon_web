const PASSED_THROUGH = ['accept', 'authorization', 'content-type', 'cookie', 'origin', 'user-agent'];

/**
 * Headers the backend gateway forwards. The client address goes along so the
 * backend rate-limits each person rather than the Next server as a whole. Only
 * the last X-Forwarded-For entry is kept: that one was added by the proxy in
 * front of Next, everything before it came from the caller.
 */
export function forwardHeaders(request: Request): Headers {
    const headers = new Headers();
    for (const name of PASSED_THROUGH) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }

    const chain = request.headers.get('x-forwarded-for');
    const client = chain?.split(',').map((part) => part.trim()).filter(Boolean).pop()
        ?? request.headers.get('x-real-ip')?.trim();
    if (client) headers.set('x-forwarded-for', client);

    return headers;
}

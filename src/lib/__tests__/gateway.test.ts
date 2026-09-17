import { describe, expect, it } from 'vitest';
import { forwardHeaders } from '@/lib/gateway';

function request(headers: Record<string, string>) {
    return new Request('http://localhost:3000/api/backend/api/v1/auth/login', { headers });
}

describe('forwardHeaders', () => {
    it('passes the client address on so each user gets their own rate limit', () => {
        const headers = forwardHeaders(request({ 'x-forwarded-for': '203.0.113.9' }));
        expect(headers.get('x-forwarded-for')).toBe('203.0.113.9');
    });

    it('keeps only the entry the nearest proxy added', () => {
        // Everything left of the last entry was written by the caller
        const headers = forwardHeaders(request({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }));
        expect(headers.get('x-forwarded-for')).toBe('203.0.113.9');
    });

    it('uses x-real-ip when that is all there is', () => {
        expect(forwardHeaders(request({ 'x-real-ip': '198.51.100.4' })).get('x-forwarded-for')).toBe('198.51.100.4');
    });

    it('forwards the auth and origin headers the backend checks', () => {
        const headers = forwardHeaders(request({
            authorization: 'Bearer t',
            cookie: 'accessToken=a',
            origin: 'http://localhost:3000',
            'content-type': 'application/json',
            'x-secret': 'nope',
        }));
        expect(headers.get('authorization')).toBe('Bearer t');
        expect(headers.get('cookie')).toBe('accessToken=a');
        expect(headers.get('origin')).toBe('http://localhost:3000');
        expect(headers.get('x-secret')).toBeNull();
    });
});

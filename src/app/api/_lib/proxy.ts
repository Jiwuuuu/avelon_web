/**
 * Shared proxy utility for Next.js API route handlers.
 * Forwards requests to the avelon_backend with proper auth and error handling.
 */
import { NextResponse } from 'next/server'

// Use non-public env var for server-side only (not exposed to browser)
const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Extract the Authorization header from the incoming request.
 */
function getAuthHeader(request: Request): Record<string, string> {
    const auth = request.headers.get('authorization')
    if (auth) return { Authorization: auth }

    // Also check cookies for token (if using cookie-based auth)
    const cookie = request.headers.get('cookie')
    if (cookie) return { Cookie: cookie }

    return {}
}

/**
 * Build clean headers for proxying (avoid forwarding host, connection, etc.)
 */
function buildProxyHeaders(request: Request, contentType?: string): Record<string, string> {
    return {
        'Content-Type': contentType || 'application/json',
        Accept: 'application/json',
        ...getAuthHeader(request),
    }
}

interface ProxyOptions {
    /** The backend endpoint path, e.g. '/api/v1/admin/users' */
    backendPath: string
    /** The incoming Next.js request */
    request: Request
    /** HTTP method override (defaults to request method) */
    method?: string
    /** Request body for POST/PUT/PATCH */
    body?: unknown
    /** Query string to append */
    query?: string
}

interface ProxyResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
    status: number
}

/**
 * Proxy a request to the avelon_backend.
 * Returns null if the backend is not configured or unreachable (caller should fall back to mock).
 */
export async function proxyToBackend<T = unknown>(
    options: ProxyOptions
): Promise<ProxyResult<T> | null> {
    if (!BACKEND_URL) return null

    const { backendPath, request, method, body, query } = options
    const url = `${BACKEND_URL}${backendPath}${query ? `?${query}` : ''}`
    const httpMethod = method || request.method || 'GET'

    try {
        const res = await fetch(url, {
            method: httpMethod,
            headers: buildProxyHeaders(request),
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await res.json()

        return {
            success: res.ok,
            data: data?.data ?? data,
            error: !res.ok ? (data?.message || data?.error || `Backend returned ${res.status}`) : undefined,
            status: res.status,
        }
    } catch (err) {
        console.error(`[API Proxy] ${httpMethod} ${url} failed:`, err)
        return null
    }
}

/**
 * Create a JSON response with consistent shape.
 */
export function jsonResponse<T>(
    data: T,
    success = true,
    status = 200,
    error?: string
) {
    return NextResponse.json(
        { success, data, ...(error ? { error } : {}) },
        { status }
    )
}

/**
 * Create an error JSON response.
 */
export function errorResponse(message: string, status = 500) {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    )
}

/**
 * API Client for Avelon Backend
 * Handles all HTTP requests with authentication
 */
import type { AuthTokens, UserRole } from '@/types';

// Browser requests stay same-origin. The Next.js backend gateway forwards them
// to the private API URL and relays HttpOnly cookies as first-party cookies.
const API_URL = '/api/backend';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * Auth storage keys
 */
let memoryAccessToken: string | null = null;

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
    return memoryAccessToken;
}

/**
 * Store auth tokens
 */
export function setTokens(tokens: AuthTokens): void {
    memoryAccessToken = tokens.accessToken;
}

/**
 * Clear auth tokens
 */
export function clearTokens(): void {
    memoryAccessToken = null;
    if (typeof window === 'undefined') return;
    document.cookie = 'avelon:authenticated=; path=/; max-age=0'; // Fix proxy loop issue
}

/**
 * Store user data
 */
export function setUser(user: SessionUser): void {
    void user;
}

/**
 * Get stored user
 */
export function getStoredUser(): SessionUser | null {
    return null;
}

/**
 * Session user type (from backend session endpoint)
 */
export interface SessionUser {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    status: string;
    kycLevel?: string;
    creditScore?: number | null;
    creditTier?: string | null;
}

/**
 * Make authenticated API request
 */
async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const accessToken = getAccessToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (accessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    // Handle 401 - try refresh token
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry with new token
            const newToken = getAccessToken();
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include',
            });
            return retryResponse.json();
        }
        // Refresh failed, clear tokens
        clearTokens();
        throw new Error('Session expired');
    }

    return response.json();
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({}),
        });

        if (!response.ok) return false;

        const result: ApiResponse<{ accessToken: string }> = await response.json();
        if (result.success && result.data) {
            memoryAccessToken = result.data.accessToken;
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// =====================================================
// AUTH API
// =====================================================

export interface LoginResponse {
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    return response.json();
}

/**
 * Logout current session
 */
export async function logout(): Promise<void> {
    try {
        await fetchWithAuth('/api/v1/auth/logout', { method: 'POST' });
    } catch {
        // Ignore errors, clear tokens anyway
    }
    clearTokens();
}

/**
 * Get current session
 */
export async function getSession(): Promise<ApiResponse<{ user: SessionUser | null; isAuthenticated: boolean }>> {
    return fetchWithAuth('/api/v1/auth/session');
}

// =====================================================
// ADMIN API (for future use)
// =====================================================

export const api = {
    get: <T>(endpoint: string) => fetchWithAuth<T>(endpoint),
    post: <T>(endpoint: string, data: unknown) =>
        fetchWithAuth<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: <T>(endpoint: string, data: unknown) =>
        fetchWithAuth<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(endpoint: string) =>
        fetchWithAuth<T>(endpoint, { method: 'DELETE' }),
};

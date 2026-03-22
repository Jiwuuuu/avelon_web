/**
 * API Client for Avelon Backend
 * Handles all HTTP requests with authentication
 */
import type { AuthTokens, UserRole } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
const AUTH_KEYS = {
    ACCESS_TOKEN: 'avelon:accessToken',
    REFRESH_TOKEN: 'avelon:refreshToken',
    USER: 'avelon:user',
} as const;

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
}

/**
 * Store auth tokens
 */
export function setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, tokens.refreshToken);
}

/**
 * Clear auth tokens
 */
export function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    document.cookie = 'avelon:authenticated=; path=/; max-age=0'; // Fix proxy loop issue
}

/**
 * Store user data
 */
export function setUser(user: SessionUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
}

/**
 * Get stored user
 */
export function getStoredUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
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
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const result: ApiResponse<AuthTokens> = await response.json();
        if (result.success && result.data) {
            setTokens(result.data);
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

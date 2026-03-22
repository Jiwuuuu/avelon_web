/**
 * Auth Context - Global authentication state management
 * Supports all user roles (RBAC) — routing is enforced at the layout level.
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import {
    login as apiLogin,
    logout as apiLogout,
    getSession,
    setTokens,
    setUser,
    getStoredUser,
    clearTokens,
    type SessionUser,
    type LoginResponse,
} from '@/lib/api';

interface AuthContextType {
    user: SessionUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            // First check localStorage for cached user
            const storedUser = getStoredUser();
            if (storedUser) {
                setUserState(storedUser);
            }

            // Then validate with backend
            try {
                const result = await getSession();
                if (result.success && result.data?.isAuthenticated && result.data.user) {
                    setUserState(result.data.user);
                    setUser(result.data.user);
                } else {
                    clearTokens();
                    setUserState(null);
                }
            } catch {
                // Session check failed, use cached if available
                if (!storedUser) {
                    clearTokens();
                    setUserState(null);
                }
            }
            setIsLoading(false);
        };

        checkSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const result = await apiLogin(email, password);

            if (!result.success || !result.data) {
                const errorMsg =
                    (typeof result.error === 'object' && result.error !== null
                        ? (result.error as { message?: string }).message
                        : result.error) ||
                    result.message ||
                    'Login failed';
                return { success: false, error: String(errorMsg) };
            }

            const { user: loginUser, accessToken, refreshToken, expiresIn } = result.data;

            // Store tokens and user (any role allowed)
            setTokens({ accessToken, refreshToken, expiresIn });
            setUser(loginUser);
            setUserState(loginUser);

            return { success: true, role: loginUser.role };
        } catch {
            return { success: false, error: 'Network error. Please check your connection and try again.' };
        }
    }, []);

    const logout = useCallback(async () => {
        document.cookie = 'avelon:authenticated=; path=/; max-age=0';
        await apiLogout();
        setUserState(null);
        router.push('/login');
    }, [router]);

    const refreshUser = useCallback(async () => {
        try {
            const result = await getSession();
            if (result.success && result.data?.user) {
                setUserState(result.data.user);
                setUser(result.data.user);
            }
        } catch {
            // Ignore refresh errors
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

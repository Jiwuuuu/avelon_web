/**
 * Auth Context - Global authentication state management
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@avelon_capstone/types';
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
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
                    // Verify user is admin
                    if (result.data.user.role !== UserRole.ADMIN) {
                        clearTokens();
                        setUserState(null);
                    } else {
                        setUserState(result.data.user);
                        setUser(result.data.user);
                    }
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
                return { success: false, error: result.message || 'Login failed' };
            }

            const { user: loginUser, accessToken, refreshToken, expiresIn } = result.data;

            // Check if user is admin
            if (loginUser.role !== UserRole.ADMIN) {
                return { success: false, error: 'Access denied. Admin only.' };
            }

            // Store tokens and user
            setTokens({ accessToken, refreshToken, expiresIn });
            setUser(loginUser);
            setUserState(loginUser);

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }, []);

    const logout = useCallback(async () => {
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

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import avelonLogo from '@/assets/avelon_nobg.png'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, isLoading: authLoading } = useAuth()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please enter your credentials')
            return
        }

        setIsLoading(true)

        const result = await login(email, password)

        if (result.success) {
            // Set cookie for middleware
            document.cookie = 'avelon:authenticated=true; path=/; max-age=86400'

            // Redirect to intended page or admin
            const from = searchParams.get('from') || '/admin'
            router.push(from)
        } else {
            setError(result.error || 'Login failed')
        }

        setIsLoading(false)
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-md rounded-3xl shadow-lg p-8 border border-gray-200">
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src={avelonLogo}
                        alt="Avelon Logo"
                        className="h-[125px] w-auto mb-4"
                        priority
                    />
                    <p className="text-center text-sm text-gray-500">
                        Admin Panel Login
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            placeholder="admin@avelon.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-50"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-6">
                    Protected by AI-based risk models & secure authentication
                </p>
            </div>
        </div>
    )
}

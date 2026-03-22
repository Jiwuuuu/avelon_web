'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@avelon_capstone/types'

// ── Icons (inline SVG) ────────────────────────────────────────────────────
const AvelonLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="2" y="8" width="10" height="16" rx="1" fill="#E85C1A" />
    <rect x="14" y="4" width="6" height="20" rx="1" fill="#E85C1A" opacity="0.6" />
    <rect x="22" y="12" width="8" height="12" rx="1" fill="#E85C1A" opacity="0.35" />
  </svg>
)

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="#E85C1A" />
    <rect x="11" y="1" width="6" height="6" rx="1" fill="#E85C1A" opacity="0.5" />
    <rect x="1" y="11" width="6" height="6" rx="1" fill="#E85C1A" opacity="0.5" />
    <rect x="11" y="11" width="6" height="6" rx="1" fill="#E85C1A" />
  </svg>
)

const IconEmail = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1.4" />
    <path d="M2 6l7 5 7-5" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="4" y="8" width="10" height="8" rx="1.5" stroke="#9CA3AF" strokeWidth="1.4" />
    <path d="M6 8V6a3 3 0 016 0v2" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const IconEye = ({ visible }: { visible: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {visible ? (
      <>
        <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="#9CA3AF" strokeWidth="1.4" />
        <circle cx="9" cy="9" r="2" stroke="#9CA3AF" strokeWidth="1.4" />
      </>
    ) : (
      <>
        <path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="#9CA3AF" strokeWidth="1.4" />
        <line x1="3" y1="3" x2="15" y2="15" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
      </>
    )}
  </svg>
)

// ── HeroIllustration ──────────────────────────────────────────────────────
const HeroIllustration = () => (
  <svg viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 520, filter: "drop-shadow(0 20px 60px rgba(232,92,26,0.15))" }}>
    <ellipse cx="280" cy="200" rx="180" ry="140" fill="#E85C1A" opacity="0.07" />
    <path d="M100 290 L260 220 L420 290 L260 360 Z" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />
    <path d="M100 290 L260 360 L260 370 L100 300 Z" fill="#E8E8E8" />
    <path d="M420 290 L260 360 L260 370 L420 300 Z" fill="#EBEBEB" />
    <path d="M160 290 L200 270 L200 190 L160 210 Z" fill="#1A1A1A" />
    <path d="M200 190 L240 170 L240 250 L200 270 Z" fill="#2A2A2A" />
    <path d="M160 210 L200 190 L240 170 L200 150 Z" fill="#333" />
    <path d="M240 290 L280 270 L280 150 L240 170 Z" fill="#1A1A1A" />
    <path d="M280 150 L320 130 L320 250 L280 270 Z" fill="#2A2A2A" />
    <path d="M240 170 L280 150 L320 130 L280 110 Z" fill="#333" />
    <path d="M320 290 L360 270 L360 200 L320 220 Z" fill="#1A1A1A" />
    <path d="M360 200 L400 180 L400 260 L360 270 Z" fill="#2A2A2A" />
    <path d="M320 220 L360 200 L400 180 L360 160 Z" fill="#333" />
    <path d="M195 260 L310 140" stroke="#E85C1A" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M295 130 L315 142 L305 162" stroke="#E85C1A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="380" cy="90" r="20" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="380" y="96" textAnchor="middle" fontSize="14" fill="#E85C1A" fontWeight="bold">$</text>
    <circle cx="120" cy="180" r="16" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="120" y="186" textAnchor="middle" fontSize="12" fill="#E85C1A" fontWeight="bold">$</text>
    <circle cx="400" cy="230" r="13" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <text x="400" y="235" textAnchor="middle" fontSize="10" fill="#E85C1A" fontWeight="bold">$</text>
    <rect x="340" y="280" width="110" height="70" rx="10" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />
    <rect x="340" y="280" width="110" height="22" rx="10" fill="#E85C1A" opacity="0.15" />
    <rect x="350" y="315" width="40" height="6" rx="3" fill="#E0E0E0" />
    <rect x="350" y="327" width="60" height="6" rx="3" fill="#F0F0F0" />
  </svg>
)

/** Return the default dashboard path for a given role. */
function getDefaultRedirect(role: UserRole | undefined): string {
    if (role === UserRole.ADMIN) return '/admin'
    return '/investor/dashboard'
}

function LoginPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, isLoading: authLoading, isAuthenticated, user } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // If already authenticated, redirect by role
    useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            const from = searchParams.get('from')
            router.push(from || getDefaultRedirect(user.role))
        }
    }, [authLoading, isAuthenticated, user, router, searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email || !password) {
            setError('Please enter your email and password.')
            return
        }

        setIsLoading(true)

        const result = await login(email, password)

        if (result.success) {
            document.cookie = 'avelon:authenticated=true; path=/; max-age=86400'
            const from = searchParams.get('from')
            router.push(from || getDefaultRedirect(result.role))
        } else {
            setError(result.error || 'Login failed')
        }

        setIsLoading(false)
    }

    if (authLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>
                Loading…
            </div>
        )
    }

    return (
        <div style={{
            minHeight: "100vh", background: "white",
            display: "flex", alignItems: "center",
            fontFamily: "'Sora', sans-serif",
            position: "relative", overflow: "hidden",
        }}>
            {/* Background glow */}
            <div style={{
                position: "absolute", bottom: -80, left: -80, width: 340, height: 340,
                background: "radial-gradient(circle, rgba(232,92,26,0.12) 0%, transparent 70%)",
                borderRadius: "50%", pointerEvents: "none",
            }} />

            <div style={{ padding: "48px 64px", width: "100%", maxWidth: 560 }}>
                <div style={{
                    background: "white", border: "1.5px solid #F0F0F0",
                    borderRadius: 24, padding: "44px 40px",
                    boxShadow: "0 8px 48px rgba(0,0,0,0.06)",
                }}>
                    {/* Badge */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "#FFF5F0", border: "1px solid #FFD4BC",
                        borderRadius: 999, padding: "6px 16px", marginBottom: 24,
                    }}>
                        <IconGrid />
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#E85C1A" }}>Decentralized Lending Platform</span>
                    </div>

                    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: -0.5 }}>
                        Welcome Back
                    </h2>
                    <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 6 }}>
                        Sign in to your account
                    </p>
                    <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 28, lineHeight: 1.6 }}>
                        Access your dashboard, manage assets, and track performance
                    </p>

                    {error && (
                        <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 12, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>{error}</p>
                    )}

                    <form onSubmit={handleLogin}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                border: "1.5px solid #E5E7EB", borderRadius: 12,
                                padding: "12px 16px", background: "#FAFAFA",
                            }}>
                                <IconEmail />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                    style={{
                                        flex: 1, border: "none", background: "none", outline: "none",
                                        fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#111",
                                    }}
                                />
                            </div>

                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                border: "1.5px solid #E5E7EB", borderRadius: 12,
                                padding: "12px 16px", background: "#FAFAFA",
                            }}>
                                <IconLock />
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    style={{
                                        flex: 1, border: "none", background: "none", outline: "none",
                                        fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#111",
                                    }}
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                    <IconEye visible={showPass} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%", marginTop: 20, padding: "14px",
                                borderRadius: 12, background: "#111", border: "none",
                                color: "white", fontFamily: "'Sora', sans-serif",
                                fontWeight: 700, fontSize: 15, cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.6 : 1,
                            }}
                        >
                            {isLoading ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    {/* Back to home */}
                    <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", marginTop: 24 }}>
                        <Link href="/" style={{ color: "#E85C1A", fontWeight: 600, fontFamily: "'Sora', sans-serif", fontSize: 13, textDecoration: "none" }}>
                            ← Back to Home
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right decorative panel */}
            <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 48,
            }}>
                <HeroIllustration />
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: white; }
                button { transition: opacity 0.15s, transform 0.15s; }
                button:hover { opacity: 0.85; }
                button:active { transform: scale(0.98); }
                input::placeholder { color: #D1D5DB; }
            `}</style>

            <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>Loading…</div>}>
                <LoginPageContent />
            </Suspense>
        </>
    )
}

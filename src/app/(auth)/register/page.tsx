'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

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

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="6" r="3" stroke="#9CA3AF" strokeWidth="1.4" />
    <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
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

const IconCheck = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#FFF5F0" stroke="#FFD4BC" strokeWidth="2" />
    <path d="M14 24l7 7 13-14" stroke="#E85C1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const inputStyle = {
  flex: 1, border: "none", background: "none", outline: "none",
  fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#111",
} as const

const fieldStyle = {
  display: "flex", alignItems: "center", gap: 12,
  border: "1.5px solid #E5E7EB", borderRadius: 12,
  padding: "12px 16px", background: "#FAFAFA",
} as const

function RegisterPageContent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || !confirm) {
      setError('Please fill in all required fields.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.')
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.')
      return
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character.')
      return
    }

    setIsLoading(true)

    try {
      const result = await api.post<{ user: { id: string; email: string } }>('/api/v1/auth/register', {
        email,
        password,
        ...(name.trim() ? { name: name.trim() } : {}),
        role: 'INVESTOR',
      })

      if (result.success) {
        setDone(true)
      } else {
        // Backend returns error as { code, message } object or string
        const raw: unknown = result.error
        const msg = typeof raw === 'string' ? raw
          : typeof raw === 'object' && raw !== null && 'message' in raw ? String((raw as { message: string }).message)
          : 'Registration failed. Please try again.'
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
          setError('An account with that email already exists.')
        } else {
          setError(msg)
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{
        minHeight: "100vh", background: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Sora', sans-serif",
      }}>
        <div style={{
          background: "white", border: "1.5px solid #F0F0F0",
          borderRadius: 24, padding: "52px 44px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.06)",
          textAlign: "center", maxWidth: 440, width: "100%",
          margin: "0 24px",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <IconCheck />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 10px", letterSpacing: -0.5 }}>
            Check Your Email
          </h2>
          <p style={{ fontSize: 14, color: "#9CA3AF", lineHeight: 1.7, marginBottom: 28 }}>
            We sent a 6-digit verification code to <strong style={{ color: "#111" }}>{email}</strong>.
            Enter it on the next page to activate your account.
          </p>
          <Link href={`/verify-email?email=${encodeURIComponent(email)}`} style={{
            display: "inline-block", padding: "13px 32px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #E85C1A, #FF8C5A)",
            color: "white",
            fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(232,92,26,0.25)",
          }}>
            Enter Verification Code
          </Link>
        </div>
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
        position: "absolute", top: -80, right: -80, width: 340, height: 340,
        background: "radial-gradient(circle, rgba(232,92,26,0.10) 0%, transparent 70%)",
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
            <span style={{ fontSize: 13, fontWeight: 500, color: "#E85C1A" }}>Investor Registration</span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: -0.5 }}>
            Create an Account
          </h2>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 6 }}>
            Join Avelon as a Liquidity Provider
          </p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 28, lineHeight: 1.6 }}>
            Deposit ETH, earn yield from lending interest, withdraw anytime
          </p>

          {error && (
            <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 12, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>{error}</p>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Name (optional) */}
              <div style={fieldStyle}>
                <IconUser />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div style={fieldStyle}>
                <IconEmail />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div style={fieldStyle}>
                <IconLock />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password (8+ chars, A-z, 0-9, special)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <IconEye visible={showPass} />
                </button>
              </div>

              {/* Confirm Password */}
              <div style={fieldStyle}>
                <IconLock />
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  required
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <IconEye visible={showConfirm} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", marginTop: 20, padding: "14px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #E85C1A, #FF8C5A)",
                border: "none",
                color: "white", fontFamily: "'Sora', sans-serif",
                fontWeight: 700, fontSize: 15, cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                boxShadow: "0 6px 20px rgba(232,92,26,0.25)",
              }}
            >
              {isLoading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          {/* Links */}
          <div style={{ textAlign: "center", marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: "#E85C1A", fontWeight: 600, fontFamily: "'Sora', sans-serif", fontSize: 13, textDecoration: "none" }}>
                Sign In
              </Link>
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              <Link href="/" style={{ color: "#9CA3AF", fontFamily: "'Sora', sans-serif", fontSize: 13, textDecoration: "none" }}>
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right decorative panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 48, flexDirection: "column", gap: 32,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <AvelonLogo />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 8px", letterSpacing: -0.5 }}>
            Avelon Liquidity Pool
          </h3>
          <p style={{ fontSize: 14, color: "#9CA3AF", lineHeight: 1.7, maxWidth: 280 }}>
            Earn passive yield by supplying ETH to our on-chain lending pool. Smart contract secured.
          </p>
        </div>
        {[
          { label: "Pool APY", value: "~8–12%" },
          { label: "Platform Fee", value: "10%" },
          { label: "Collateral Type", value: "ETH" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#FAFAFA", border: "1px solid #F0F0F0",
            borderRadius: 12, padding: "14px 20px", width: "100%", maxWidth: 280,
          }}>
            <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Sora', sans-serif" }}>{label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111", fontFamily: "'Sora', sans-serif" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
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
        <RegisterPageContent />
      </Suspense>
    </>
  )
}

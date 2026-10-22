'use client'

import { useState, useRef, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { errorMessage } from '@/lib/api-errors'

// ── Icons ────────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="#E85C1A" />
    <rect x="11" y="1" width="6" height="6" rx="1" fill="#E85C1A" opacity="0.5" />
    <rect x="1" y="11" width="6" height="6" rx="1" fill="#E85C1A" opacity="0.5" />
    <rect x="11" y="11" width="6" height="6" rx="1" fill="#E85C1A" />
  </svg>
)

const IconCheck = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#FFF5F0" stroke="#FFD4BC" strokeWidth="2" />
    <path d="M14 24l7 7 13-14" stroke="#E85C1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const OTP_LENGTH = 6

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [resendIn, setResendIn] = useState(60)
  const [resending, setResending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // The backend allows a new code once a minute
  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const resend = async () => {
    if (!email || resendIn > 0) return
    setResending(true)
    setError(null)
    setNotice(null)
    try {
      const result = await api.post<{ message: string }>('/api/v1/auth/resend-verification', { email })
      if (result.success) {
        setNotice('A new code is on its way. Codes last 1 hour.')
        setResendIn(60)
      } else {
        setError(errorMessage(result, 'Could not send a new code. Try again in a minute.'))
      }
    } catch {
      setError('Could not send a new code. Try again in a minute.')
    } finally {
      setResending(false)
    }
  }

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[index] = digit
    setDigits(updated)
    setError(null)

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1 && updated.every(d => d)) {
      submitOTP(updated.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    const updated = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i]
    }
    setDigits(updated)
    setError(null)

    // Focus the next empty or last input
    const nextEmpty = updated.findIndex(d => !d)
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus()

    // Auto-submit if complete
    if (updated.every(d => d)) {
      submitOTP(updated.join(''))
    }
  }

  const submitOTP = async (token: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await api.post<{ message: string }>('/api/v1/auth/verify-email', { token })

      if (result.success) {
        setVerified(true)
      } else {
        const raw: unknown = result.error
        const msg = typeof raw === 'string' ? raw
          : typeof raw === 'object' && raw !== null && 'message' in raw ? String((raw as { message: string }).message)
          : 'Verification failed.'
        setError(msg)
        // Clear inputs for retry
        setDigits(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const token = digits.join('')
    if (token.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code.')
      return
    }
    submitOTP(token)
  }

  // ── Success state ──
  if (verified) {
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
            Email Verified
          </h2>
          <p style={{ fontSize: 14, color: "#9CA3AF", lineHeight: 1.7, marginBottom: 28 }}>
            Your account is now verified. You can sign in to access your investor dashboard.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: "13px 32px", borderRadius: 12,
              background: "linear-gradient(135deg, #E85C1A, #FF8C5A)",
              color: "white", border: "none",
              fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(232,92,26,0.25)",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // ── OTP form ──
  return (
    <div style={{
      minHeight: "100vh", background: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Sora', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(232,92,26,0.08) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{
        background: "white", border: "1.5px solid #F0F0F0",
        borderRadius: 24, padding: "44px 40px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.06)",
        maxWidth: 440, width: "100%", margin: "0 24px",
        position: "relative",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#FFF5F0", border: "1px solid #FFD4BC",
          borderRadius: 999, padding: "6px 16px", marginBottom: 24,
        }}>
          <IconGrid />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#E85C1A" }}>Email Verification</span>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: -0.5 }}>
          Enter Verification Code
        </h2>
        <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 6 }}>
          We sent a 6-digit code to{email ? '' : ' your email'}
        </p>
        {email && (
          <p style={{ fontSize: 14, color: "#111", fontWeight: 600, marginBottom: 6 }}>
            {email}
          </p>
        )}
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 28, lineHeight: 1.6 }}>
          Check your inbox and enter the code below
        </p>

        {notice && !error && (
          <p role="status" style={{
            fontSize: 13, color: "#166534", marginBottom: 12,
            padding: "10px 14px", background: "#F0FDF4",
            borderRadius: 10, border: "1px solid #BBF7D0",
          }}>{notice}</p>
        )}

        {error && (
          <p style={{
            fontSize: 13, color: "#B91C1C", marginBottom: 12,
            padding: "10px 14px", background: "#FEF2F2",
            borderRadius: 10, border: "1px solid #FECACA",
          }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* OTP digit inputs */}
          <div style={{
            display: "flex", gap: 10, justifyContent: "center",
            marginBottom: 24,
          }}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={isLoading}
                style={{
                  width: 48, height: 56,
                  textAlign: "center",
                  fontSize: 22, fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                  color: "#111",
                  border: digit ? "2px solid #E85C1A" : "1.5px solid #E5E7EB",
                  borderRadius: 12,
                  background: digit ? "#FFF5F0" : "#FAFAFA",
                  outline: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = '#E85C1A' }}
                onBlur={(e) => { if (!digit) e.target.style.borderColor = '#E5E7EB' }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || digits.some(d => !d)}
            style={{
              width: "100%", padding: "14px",
              borderRadius: 12,
              background: digits.every(d => d)
                ? "linear-gradient(135deg, #E85C1A, #FF8C5A)"
                : "#E5E7EB",
              border: "none",
              color: digits.every(d => d) ? "white" : "#9CA3AF",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700, fontSize: 15,
              cursor: isLoading || digits.some(d => !d) ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              boxShadow: digits.every(d => d) ? "0 6px 20px rgba(232,92,26,0.25)" : "none",
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            }}
          >
            {isLoading ? "Verifying…" : "Verify Email"}
          </button>
        </form>

        {/* Links */}
        <div style={{ textAlign: "center", marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          {email && (
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              Didn&apos;t get it?{' '}
              <button
                type="button"
                onClick={resend}
                disabled={resending || resendIn > 0}
                style={{
                  background: "none", border: "none", padding: 0,
                  color: resendIn > 0 ? "#9CA3AF" : "#E85C1A", fontWeight: 600,
                  fontFamily: "'Sora', sans-serif", fontSize: 13,
                  cursor: resending || resendIn > 0 ? "default" : "pointer",
                }}
              >
                {resending ? "Sending…" : resendIn > 0 ? `Send a new code in ${resendIn}s` : "Send a new code"}
              </button>
            </p>
          )}
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>
            Already verified?{' '}
            <Link href="/login" style={{ color: "#E85C1A", fontWeight: 600, fontFamily: "'Sora', sans-serif", fontSize: 13, textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>
            <Link href="/register" style={{ color: "#9CA3AF", fontFamily: "'Sora', sans-serif", fontSize: 13, textDecoration: "none" }}>
              ← Back to Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
      </Suspense>
    </>
  )
}

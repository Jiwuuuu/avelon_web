'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { errorMessage } from '@/lib/api-errors'
import { passwordProblem } from '@/lib/password-rules'

// Email -> 6-digit code from the email -> new password, against
// /auth/forgot-password, /validate-reset-token and /reset-password.
type Step = 'email' | 'code' | 'password' | 'done'

const card: CSSProperties = {
  background: 'white', border: '1.5px solid #F0F0F0', borderRadius: 24, padding: '44px 40px',
  boxShadow: '0 8px 48px rgba(0,0,0,0.06)', maxWidth: 440, width: '100%', margin: '0 24px',
}
const field: CSSProperties = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '13px 16px',
  background: '#FAFAFA', fontFamily: "'Sora', sans-serif", fontSize: 14, color: '#111', outline: 'none',
}
const primary = (enabled: boolean): CSSProperties => ({
  width: '100%', padding: 14, borderRadius: 12, border: 'none', marginTop: 16,
  background: enabled ? 'linear-gradient(135deg, #E85C1A, #FF8C5A)' : '#E5E7EB',
  color: enabled ? 'white' : '#9CA3AF', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
  cursor: enabled ? 'pointer' : 'not-allowed',
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function call<T>(path: string, body: unknown, fallback: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await api.post<T>(path, body)
      if (!res.success) throw new Error(errorMessage(res, fallback))
      return res
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function sendCode(e?: FormEvent) {
    e?.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter the email address you signed up with.')
    const res = await call('/api/v1/auth/forgot-password', { email: email.trim() }, 'Could not send a reset code.')
    if (!res) return
    setNotice('If an account uses that email, a 6-digit code is on its way. It lasts 1 hour.')
    setStep('code')
  }

  async function checkCode(e: FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from the email.')
    const res = await call<{ valid: boolean }>('/api/v1/auth/validate-reset-token', { token: code }, 'That code is not valid.')
    if (!res) return
    if (res.data && res.data.valid === false) return setError('That code is invalid or has expired. Send a new one.')
    setNotice(null)
    setStep('password')
  }

  async function reset(e: FormEvent) {
    e.preventDefault()
    const problem = passwordProblem(password)
    if (problem) return setError(problem)
    if (password !== confirm) return setError('The passwords do not match.')
    const res = await call('/api/v1/auth/reset-password', { token: code, password }, 'Could not reset your password.')
    if (res) setStep('done')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; }
        input::placeholder { color: #D1D5DB; }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif" }}>
        <div style={card}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', margin: '0 0 6px', letterSpacing: -0.5 }}>
            {step === 'done' ? 'Password changed' : 'Reset your password'}
          </h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24, lineHeight: 1.6 }}>
            {step === 'email' && 'Enter your email and we will send you a 6-digit code.'}
            {step === 'code' && <>Enter the code sent to <strong style={{ color: '#111' }}>{email.trim()}</strong>.</>}
            {step === 'password' && 'Choose a new password.'}
            {step === 'done' && 'You can now sign in with your new password.'}
          </p>

          {notice && !error && (
            <p role="status" style={{ fontSize: 13, color: '#166534', marginBottom: 12, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>{notice}</p>
          )}
          {error && (
            <p role="alert" style={{ fontSize: 13, color: '#B91C1C', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>{error}</p>
          )}

          {step === 'email' && (
            <form onSubmit={sendCode}>
              <input type="email" autoComplete="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={field} disabled={busy} />
              <button type="submit" disabled={busy || !email} style={primary(!busy && !!email)}>{busy ? 'Sending…' : 'Send code'}</button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={checkCode}>
              <input
                inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                style={{ ...field, letterSpacing: 8, fontSize: 20, fontWeight: 700, textAlign: 'center' }} disabled={busy}
              />
              <button type="submit" disabled={busy || code.length !== 6} style={primary(!busy && code.length === 6)}>{busy ? 'Checking…' : 'Continue'}</button>
              <button type="button" onClick={() => sendCode()} disabled={busy} style={{ marginTop: 14, background: 'none', border: 'none', color: '#E85C1A', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                Send a new code
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={reset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="password" autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} style={field} disabled={busy} />
              <input type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={field} disabled={busy} />
              <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>At least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol.</p>
              <button type="submit" disabled={busy || !password} style={{ ...primary(!busy && !!password), marginTop: 4 }}>{busy ? 'Saving…' : 'Reset password'}</button>
            </form>
          )}

          {step === 'done' && (
            <button type="button" onClick={() => router.push('/login')} style={primary(true)}>Sign in</button>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#9CA3AF' }}>
            <Link href="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}

"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { ShieldCheck, KeyRound, Loader2, CheckCircle, AlertTriangle, X, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { PASSWORD_RULES } from "@/lib/password-rules"
import { errorMessage } from "@/lib/api-errors"


export default function Settings() {
  const { user, logout } = useAuth()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const resetForm = () => {
    setFormError("")
    setFormSuccess("")
    setNewPassword("")
    setConfirmPassword("")
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    setFormSuccess("")

    const form = event.currentTarget
    const data = new FormData(form)
    const currentPassword = data.get("currentPassword") as string
    const newPwd = data.get("newPassword") as string
    const confirmPwd = data.get("confirmPassword") as string

    if (!currentPassword || !newPwd || !confirmPwd) {
      setFormError("All fields are required.")
      return
    }

    if (newPwd !== confirmPwd) {
      setFormError("New password and confirmation do not match.")
      return
    }

    if (currentPassword === newPwd) {
      setFormError("New password must be different from current password.")
      return
    }

    const failedRules = PASSWORD_RULES.filter((r) => !r.test(newPwd))
    if (failedRules.length > 0) {
      setFormError(`Password must have: ${failedRules.map((r) => r.label.toLowerCase()).join(", ")}`)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await api.post<{ message: string }>("/api/v1/auth/change-password", {
        currentPassword,
        newPassword: newPwd,
      })
      if (result.success) {
        // The backend ends every session on a password change, this one included
        setFormSuccess("Password changed. Signing you out so you can sign in with the new one…")
        form.reset()
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => { void logout() }, 2000)
      } else {
        setFormError(errorMessage(result, "Failed to change password."))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change password. Check your current password."
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Update operator profile and session controls.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Admin Profile */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-xs uppercase tracking-wide">Admin Profile</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(user?.name ?? user?.email ?? "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user?.name ?? "Admin"}</p>
                  <p className="text-sm text-gray-500">{user?.email ?? "—"} • {user?.role ?? "ADMIN"}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-600">
              <p className="text-xs uppercase text-gray-400">Account Status</p>
              <p className="mt-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                {user?.status ?? "—"}
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-3xl bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-gray-400">Security</p>
                <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
              </div>
              <KeyRound size={18} className="text-orange-500" />
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Password</p>
                  <p className="text-xs text-gray-500">Change your admin password</p>
                </div>
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsPasswordModalOpen(true) }}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
                >
                  Change password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Update Password</h3>
                <p className="text-sm text-gray-500">Enter your current password and choose a new one.</p>
              </div>
              <button type="button" onClick={() => { setIsPasswordModalOpen(false); resetForm() }} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900"><X size={16} /></button>
            </div>

            {/* Success banner */}
            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                <CheckCircle size={16} /> {formSuccess}
              </div>
            )}

            {/* Error banner */}
            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertTriangle size={16} /> {formError}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
              <label className="block text-sm font-medium text-gray-700">
                Current password
                <div className="relative mt-2">
                  <input
                    name="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                New password
                <div className="relative mt-2">
                  <input
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="Min 8 chars, upper, lower, number, special"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {/* Password strength indicators */}
              {newPassword && (
                <div className="space-y-1.5 rounded-xl bg-gray-50 p-3">
                  {PASSWORD_RULES.map((rule) => {
                    const pass = rule.test(newPassword)
                    return (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs ${pass ? "text-green-600" : "text-gray-400"}`}>
                        {pass ? <CheckCircle size={12} /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                        {rule.label}
                      </div>
                    )
                  })}
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700">
                Confirm password
                <div className="relative mt-2">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 ${confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </label>

              <div className="flex items-center justify-between pt-2 text-sm">
                <button type="button" onClick={() => { setIsPasswordModalOpen(false); resetForm() }} className="font-medium text-gray-500 hover:text-gray-800">Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

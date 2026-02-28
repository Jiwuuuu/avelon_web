"use client"

import { useState } from "react"
import { ShieldCheck, KeyRound } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Settings() {
  const { user } = useAuth()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

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
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
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
            <h3 className="text-2xl font-semibold text-gray-900">Update Password</h3>
            <p className="text-sm text-gray-500">Enter your current password and choose a new one.</p>
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsPasswordModalOpen(false) }}>
              <label className="text-sm font-medium text-gray-700">
                Current password
                <input type="password" placeholder="••••••••" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="text-sm font-medium text-gray-700">
                New password
                <input type="password" placeholder="Use at least 12 characters" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Confirm password
                <input type="password" placeholder="Repeat new password" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              </label>
              <div className="flex items-center justify-between pt-2 text-sm">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="font-medium text-gray-500 hover:text-gray-800">Cancel</button>
                <button type="submit" className="rounded-xl bg-orange-500 px-5 py-2 text-white font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

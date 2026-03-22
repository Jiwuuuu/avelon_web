"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Profile / Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Preferences and security.</p>
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">Account</h2>
        <div className="text-sm space-y-2">
          <p className="text-stone-600"><span className="font-medium text-stone-800">Email:</span> {user.email}</p>
          <p className="text-stone-600"><span className="font-medium text-stone-800">Name:</span> {user.name || '—'}</p>
          <p className="text-stone-600"><span className="font-medium text-stone-800">Role:</span> {user.role}</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">Account preferences</h2>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span className="text-stone-600">Display currency (USD)</span>
          <span className="text-stone-400 text-xs">Coming soon</span>
        </label>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">Notification settings</h2>
        <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
          <span className="text-stone-600">Email summaries</span>
          <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} className="rounded border-stone-300" />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
          <span className="text-stone-600">Push / in-app alerts</span>
          <input type="checkbox" checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} className="rounded border-stone-300" />
        </label>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">Security settings</h2>
        <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
          <span className="text-stone-600">Require confirmation for withdrawals</span>
          <input type="checkbox" defaultChecked className="rounded border-stone-300" />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
          <span className="text-stone-600">Two-factor authentication</span>
          <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="rounded border-stone-300" />
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => logout()} className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
          Log out
        </button>
      </div>
    </div>
  );
}

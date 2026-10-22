"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-errors";
import { passwordProblem } from "@/lib/password-rules";

type Preferences = {
  emailLoanUpdates: boolean;
  emailRepaymentReminders: boolean;
  emailLiquidationAlerts: boolean;
  emailMarketingNews: boolean;
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [savingPref, setSavingPref] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  useEffect(() => {
    api.get<Preferences>("/api/v1/notifications/preferences").then((res) => {
      if (res.success && res.data) setPrefs(res.data);
      else setPrefsError(errorMessage(res, "Could not load your notification settings."));
    }).catch(() => setPrefsError("Could not load your notification settings."));
  }, []);

  async function toggleEmail(value: boolean) {
    if (!prefs) return;
    const before = prefs;
    setPrefs({ ...prefs, emailLoanUpdates: value });
    setSavingPref(true);
    setPrefsError(null);
    const res = await api.put<Preferences>("/api/v1/notifications/preferences", { emailLoanUpdates: value });
    setSavingPref(false);
    if (res.success && res.data) setPrefs(res.data);
    else {
      setPrefs(before);
      setPrefsError(errorMessage(res, "That change was not saved."));
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwDone(false);
    if (!current) return setPwError("Enter your current password.");
    const problem = passwordProblem(next);
    if (problem) return setPwError(problem);
    if (next !== confirm) return setPwError("The new passwords do not match.");
    if (next === current) return setPwError("Choose a password different from the current one.");

    setPwBusy(true);
    const res = await api.post<{ message: string }>("/api/v1/auth/change-password", { currentPassword: current, newPassword: next });
    setPwBusy(false);
    if (!res.success) return setPwError(errorMessage(res, "Could not change your password."));
    setCurrent("");
    setNext("");
    setConfirm("");
    setPwDone(true);
    // The backend ends every session on a password change, this one included
    setTimeout(() => { void logout(); }, 2000);
  }

  if (!user) return null;

  const input = "mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:border-stone-900 focus:outline-none";

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Profile and settings</h1>
        <p className="text-stone-500 text-sm mt-1">Your account, email notifications and password.</p>
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">Account</h2>
        <div className="text-sm space-y-2">
          <p className="text-stone-600"><span className="font-medium text-stone-800">Email:</span> {user.email}</p>
          <p className="text-stone-600"><span className="font-medium text-stone-800">Name:</span> {user.name || "—"}</p>
          <p className="text-stone-600"><span className="font-medium text-stone-800">Role:</span> Investor</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-800">Email notifications</h2>
        {prefsError && <p className="text-sm text-red-600">{prefsError}</p>}
        {!prefs && !prefsError && <div className="h-10 bg-stone-100 rounded animate-pulse" />}
        {prefs && (
          <label className="flex items-start justify-between gap-4 text-sm cursor-pointer">
            <span>
              <span className="block text-stone-800 font-medium">Deposits, withdrawals and yield claims</span>
              <span className="block text-stone-500 text-xs mt-0.5">An email each time the pool confirms one of your transactions.</span>
            </span>
            <input
              type="checkbox"
              checked={prefs.emailLoanUpdates}
              disabled={savingPref}
              onChange={(e) => toggleEmail(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 accent-[#E85C1A]"
            />
          </label>
        )}
        <p className="text-xs text-stone-500">In-app notifications are always on.</p>
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-800">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-stone-600">
            Current password
            <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={input} />
          </label>
          <label className="block text-xs font-medium text-stone-600">
            New password
            <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={input} />
          </label>
          <label className="block text-xs font-medium text-stone-600">
            Confirm new password
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
          </label>
          <p className="text-xs text-stone-500">At least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol.</p>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          {pwDone && <p className="text-sm text-emerald-700">Password changed. Signing you out so you can sign in with the new one…</p>}
          <button
            type="submit"
            disabled={pwBusy}
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:bg-stone-300"
          >
            {pwBusy ? "Saving…" : "Change password"}
          </button>
        </form>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => logout()} className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
          Log out
        </button>
      </div>
    </div>
  );
}

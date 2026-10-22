"use client"

import { useCallback, useEffect, useState } from "react"
import { Clock, Mail, Play, RefreshCw, TrendingDown, Unlock } from "lucide-react"
import { api, getAccessToken } from "@/lib/api"
import { errorMessage } from "@/lib/api-errors"

type DevState = {
  enabled: boolean
  chainTime: string
  offsetMs: number
  ethPricePHP: number
  priceHeld: boolean
  emailDelivery: "gmail" | "outbox" | "log"
  jobs: string[]
}

type OutboxEntry = { id: string; to: string; subject: string; sentAt: string }

const JOB_LABELS: Record<string, string> = {
  reminders: "Repayment reminders",
  overdue: "Overdue sweep",
  "auto-liquidate": "Auto-liquidation",
  expiry: "Expire stale loans",
  "risk-monitor": "Margin calls",
}

function formatOffset(ms: number) {
  if (ms < 60_000) return "in step with real time"
  const hours = ms / 3_600_000
  return hours >= 48 ? `${(hours / 24).toFixed(1)} days ahead` : `${hours.toFixed(1)} hours ahead`
}

export default function DemoControls() {
  const [state, setState] = useState<DevState | null>(null)
  const [unavailable, setUnavailable] = useState<string | null>(null)
  const [price, setPrice] = useState("")
  const [days, setDays] = useState("1")
  const [busy, setBusy] = useState<string | null>(null)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [outbox, setOutbox] = useState<OutboxEntry[]>([])
  const [preview, setPreview] = useState<{ entry: OutboxEntry; html: string } | null>(null)

  const load = useCallback(async () => {
    const res = await api.get<DevState>("/api/v1/admin/dev/state")
    if (!res.success || !res.data) {
      setUnavailable(errorMessage(res, "Demo controls are not available on this server."))
      return
    }
    setUnavailable(null)
    setState(res.data)
    setPrice((p) => p || String(Math.round(res.data!.ethPricePHP)))
    const mail = await api.get<OutboxEntry[]>("/api/v1/admin/dev/outbox?limit=25")
    if (mail.success && mail.data) setOutbox(mail.data)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function act(key: string, path: string, body: unknown, describe: (data: any) => string) {
    setBusy(key)
    setResult(null)
    try {
      const res = await api.post<any>(path, body)
      if (!res.success) throw new Error(errorMessage(res, "That did not work."))
      setResult({ ok: true, text: describe(res.data) })
      await load()
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "That did not work." })
    } finally {
      setBusy(null)
    }
  }

  const jobSummary = (jobs: Record<string, number> | null | undefined) =>
    jobs
      ? Object.entries(jobs).map(([name, n]) => `${JOB_LABELS[name] ?? name}: ${n < 0 ? "failed" : n}`).join(" · ")
      : ""

  const setHeldPrice = (value: number) =>
    act("price", "/api/v1/admin/dev/price", { price: value }, (d) =>
      `ETH/PHP held at ₱${Math.round(d.ethPricePHP).toLocaleString()}. ${d.marginCalls} margin call(s) sent.`)

  async function openEmail(entry: OutboxEntry) {
    const token = getAccessToken()
    const res = await fetch(`/api/backend/api/v1/admin/dev/outbox/${entry.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
    if (res.ok) setPreview({ entry, html: await res.text() })
  }

  const card = "bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
  const button = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"

  if (unavailable) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Demo Controls</h1>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {unavailable} They only run on a development server connected to the local Hardhat chain (31337).
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-6 max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demo Controls</h1>
            <p className="text-sm text-gray-500 mt-1">
              Local chain only. Move the ETH price, skip ahead in time and run the loan jobs, to show margin calls, reminders, overdue loans and liquidation without waiting.
            </p>
          </div>
          <button onClick={load} className={`${button} bg-white border border-gray-200 text-gray-700`}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {result && (
          <div className={`rounded-xl border p-4 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
            {result.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className={card}>
            <div className="flex items-center gap-2"><TrendingDown size={18} className="text-orange-500" /><h2 className="font-semibold text-gray-900">ETH price</h2></div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{state ? `₱${Math.round(state.ethPricePHP).toLocaleString()}` : "…"}</p>
            <p className="text-xs text-gray-500">{state?.priceHeld ? "Held by you. The hourly feed won't change it." : "Following the hourly CoinGecko feed."}</p>
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-40 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                aria-label="ETH price in pesos"
              />
              <button onClick={() => setHeldPrice(Number(price))} disabled={!Number(price) || busy !== null} className={`${button} bg-gray-900 text-white`}>
                Set and check
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[-30, -20, -10, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => state && setHeldPrice(Math.round(state.ethPricePHP * (1 + pct / 100)))}
                  disabled={!state || busy !== null}
                  className={`${button} border border-gray-200 bg-white text-gray-700 py-1.5`}
                >
                  {pct > 0 ? `+${pct}` : pct}%
                </button>
              ))}
              {state?.priceHeld && (
                <button
                  onClick={() => act("release", "/api/v1/admin/dev/price/release", {}, () => "Price handed back to the hourly feed.")}
                  disabled={busy !== null}
                  className={`${button} border border-gray-200 bg-white text-gray-700 py-1.5`}
                >
                  <Unlock size={14} /> Release
                </button>
              )}
            </div>
            <p className="mt-3 text-xs text-gray-500">Setting a price runs the margin-call check at once. A price move never liquidates a loan.</p>
          </section>

          <section className={card}>
            <div className="flex items-center gap-2"><Clock size={18} className="text-orange-500" /><h2 className="font-semibold text-gray-900">Chain time</h2></div>
            <p className="mt-2 text-lg font-bold text-gray-900">{state ? new Date(state.chainTime).toLocaleString() : "…"}</p>
            <p className="text-xs text-gray-500">{state ? formatOffset(state.offsetMs) : ""}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 3, 7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => act("ff", "/api/v1/admin/dev/fast-forward", { days: d }, (data) => `Moved forward ${d} day(s). ${jobSummary(data.jobs)}`)}
                  disabled={busy !== null}
                  className={`${button} border border-gray-200 bg-white text-gray-700 py-1.5`}
                >
                  +{d} day{d > 1 ? "s" : ""}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                min={0.05}
                step={0.5}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                aria-label="Days to move forward"
              />
              <button
                onClick={() => act("ff", "/api/v1/admin/dev/fast-forward", { days: Number(days) }, (data) => `Moved forward ${days} day(s). ${jobSummary(data.jobs)}`)}
                disabled={!(Number(days) > 0) || busy !== null}
                className={`${button} bg-gray-900 text-white`}
              >
                {busy === "ff" ? "Moving…" : "Fast-forward"}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">Moves the Hardhat clock and the backend's loan clock together, then runs every job.</p>
          </section>
        </div>

        <section className={card}>
          <div className="flex items-center gap-2"><Play size={18} className="text-orange-500" /><h2 className="font-semibold text-gray-900">Run a job now</h2></div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(state?.jobs ?? []).map((job) => (
              <button
                key={job}
                onClick={() => act(job, `/api/v1/admin/dev/jobs/${job}`, {}, (data) => jobSummary(data))}
                disabled={busy !== null}
                className={`${button} border border-gray-200 bg-white text-gray-700`}
              >
                {busy === job ? "Running…" : JOB_LABELS[job] ?? job}
              </button>
            ))}
            <button
              onClick={() => act("all", "/api/v1/admin/dev/jobs/all", {}, (data) => jobSummary(data))}
              disabled={busy !== null}
              className={`${button} bg-gray-900 text-white`}
            >
              {busy === "all" ? "Running…" : "Run all"}
            </button>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Mail size={18} className="text-orange-500" /><h2 className="font-semibold text-gray-900">Email outbox</h2></div>
            <span className="text-xs text-gray-500">Delivery: {state?.emailDelivery ?? "…"}</span>
          </div>
          {state && state.emailDelivery !== "outbox" && (
            <p className="mt-2 text-xs text-gray-500">Emails go out through {state.emailDelivery === "gmail" ? "Gmail" : "the server log"}, so nothing collects here. Set EMAIL_DELIVERY=outbox to capture them locally.</p>
          )}
          {outbox.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No emails captured yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-100">
              {outbox.map((e) => (
                <li key={e.id}>
                  <button onClick={() => openEmail(e)} className="w-full text-left py-3 flex items-center justify-between gap-4 hover:bg-gray-50 px-2 rounded-lg">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{e.subject}</span>
                      <span className="block text-xs text-gray-500">{e.to}</span>
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">{new Date(e.sentAt).toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreview(null)}>
          <div className="w-full max-w-2xl mx-4 bg-white rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{preview.entry.subject}</p>
                <p className="text-xs text-gray-500">To {preview.entry.to}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-sm text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <iframe title="Email preview" srcDoc={preview.html} sandbox="" className="w-full h-[60vh] rounded-xl border border-gray-200" />
          </div>
        </div>
      )}
    </div>
  )
}

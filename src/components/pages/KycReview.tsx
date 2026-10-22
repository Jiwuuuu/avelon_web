"use client"

import { useEffect, useState } from "react"
import { RefreshCw, ShieldCheck, ShieldX, X, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { api, getAccessToken } from "@/lib/api"
import { errorMessage } from "@/lib/api-errors"
import { TablePageSkeleton } from "@/components/skeletons"

type KycDocument = {
  id: string
  type: string
  status: string
  fileName: string
  aiVerified: boolean | null
  aiConfidence: number | null
  aiFraudScore: number | null
  faceMatchScore: number | null
  faceMatchPassed: boolean | null
  createdAt: string
}

type Applicant = {
  id: string
  email: string
  name: string | null
  status: "PENDING_KYC" | "REJECTED"
  kycSubmittedAt: string | null
  kycRejectionReason: string | null
  creditScore: number | null
  documents: KycDocument[]
}

type Filter = "all" | "pending" | "rejected"

// Mirrors deriveTier in the backend, which sets the tier from the score
function tierFor(score: number) {
  if (score >= 90) return "VIP"
  if (score >= 80) return "PREMIUM"
  if (score >= 60) return "STANDARD"
  return "BASIC"
}

/** Documents are served behind admin auth, so they're fetched as blobs, not linked. */
function DocumentPreview({ doc }: { doc: KycDocument }) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    const token = getAccessToken()
    fetch(`/api/backend/api/v1/admin/kyc/documents/${doc.id}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        objectUrl = URL.createObjectURL(await res.blob())
        setUrl(objectUrl)
      })
      .catch(() => setFailed(true))
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc.id])

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{doc.type.replace(/_/g, " ")}</span>
        <span className={`text-xs font-medium ${doc.aiVerified ? "text-green-600" : doc.status === "REJECTED" ? "text-red-600" : "text-amber-600"}`}>
          {doc.aiVerified ? "AI verified" : doc.status.toLowerCase()}
        </span>
      </div>
      <div className="aspect-[4/3] rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
        {url ? (
          <img src={url} alt={doc.type} className="max-h-full max-w-full object-contain" />
        ) : failed ? (
          <span className="text-xs text-gray-400">Preview unavailable</span>
        ) : (
          <Loader2 size={18} className="animate-spin text-gray-300" />
        )}
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-gray-500">
        {doc.aiConfidence != null && <span>Confidence {Math.round(doc.aiConfidence * 100)}%</span>}
        {doc.aiFraudScore != null && <span>Fraud {Math.round(doc.aiFraudScore * 100)}%</span>}
        {doc.faceMatchScore != null && <span>Face match {Math.round(doc.faceMatchScore * 100)}%</span>}
      </div>
    </div>
  )
}

function ReviewModal({
  applicant,
  onClose,
  onDecided,
}: {
  applicant: Applicant
  onClose: () => void
  onDecided: () => void
}) {
  const [score, setScore] = useState(String(applicant.creditScore ?? 30))
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scoreNum = Number(score)
  const scoreValid = Number.isInteger(scoreNum) && scoreNum >= 0 && scoreNum <= 100
  const selfie = applicant.documents.find((d) => d.type === "SELFIE")
  const decidable = applicant.status === "PENDING_KYC" || applicant.status === "REJECTED"

  const decide = async (verdict: "approve" | "reject") => {
    setBusy(verdict)
    setError(null)
    try {
      const res = await api.put<unknown>(
        `/api/v1/admin/kyc/${applicant.id}/${verdict}`,
        verdict === "approve" ? { creditScore: scoreNum } : { reason: reason.trim() },
      )
      if (!res.success) throw new Error(errorMessage(res, `Could not ${verdict} this verification.`))
      onDecided()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${verdict} this verification.`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{applicant.name ?? applicant.email}</h2>
            <p className="text-sm text-gray-500">{applicant.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {applicant.status === "REJECTED" && applicant.kycRejectionReason && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold mb-1">Rejected by the AI check</p>
            <p>{applicant.kycRejectionReason}</p>
            <p className="mt-2 text-red-700">Approving overturns this decision.</p>
          </div>
        )}

        {selfie && (
          <div className={`mb-6 rounded-xl border p-4 flex items-center gap-3 ${selfie.faceMatchPassed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            {selfie.faceMatchPassed ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-amber-600" size={20} />}
            <p className="text-sm text-gray-800">
              {selfie.faceMatchPassed ? "Selfie matches the ID photo" : "Selfie did not clearly match the ID photo"}
              {selfie.faceMatchScore != null && ` (${Math.round(selfie.faceMatchScore * 100)}%)`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {applicant.documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents on file.</p>
          ) : (
            applicant.documents.map((doc) => <DocumentPreview key={doc.id} doc={doc} />)
          )}
        </div>

        {error && <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        {decidable && (
          <div className="mt-8 pt-6 border-t border-gray-200 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Approve</h3>
              <label className="mt-2 block text-xs text-gray-500">
                Credit score (0–100)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                {scoreValid ? `Tier: ${tierFor(scoreNum)}. Starter needs 30, Standard 60, Premium 80, VIP 90.` : "Enter a whole number from 0 to 100."}
              </p>
              <button
                onClick={() => decide("approve")}
                disabled={!scoreValid || busy !== null}
                className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300"
              >
                <ShieldCheck size={16} /> {busy === "approve" ? "Approving…" : "Approve verification"}
              </button>
            </div>
            {applicant.status === "PENDING_KYC" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Reject</h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="What should the borrower fix? They see this."
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
                <button
                  onClick={() => decide("reject")}
                  disabled={reason.trim().length < 5 || busy !== null}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300"
                >
                  <ShieldX size={16} /> {busy === "reject" ? "Rejecting…" : "Reject verification"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function KycReview() {
  const [filter, setFilter] = useState<Filter>("all")
  const { data, loading, error, refresh } = useCachedFetch<Applicant[]>(`/api/v1/admin/kyc/pending?status=${filter}&limit=50`, 10_000)
  const [open, setOpen] = useState<Applicant | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const applicants = data ?? []

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYC Review</h1>
            <p className="text-sm text-gray-500 mt-1">
              Verifications still running, and ones the AI rejected. Approve to let the borrower apply, or reject with a reason they can act on.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">Pending and rejected</option>
              <option value="pending">Pending only</option>
              <option value="rejected">AI-rejected only</option>
            </select>
            <button onClick={refresh} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">{message}</div>}

        {loading && <TablePageSkeleton columns={5} />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Applicant", "Submitted", "Status", "Documents", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nothing waiting for review.</td>
                  </tr>
                ) : (
                  applicants.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{a.name ?? "—"}</p>
                        <p className="text-xs text-gray-500">{a.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.kycSubmittedAt ? new Date(a.kycSubmittedAt).toLocaleString() : "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${a.status === "PENDING_KYC" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {a.status === "PENDING_KYC" ? "PENDING" : "AI REJECTED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.documents.length}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => { setMessage(null); setOpen(a) }} className="text-blue-600 hover:text-blue-800 font-medium">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <ReviewModal
          applicant={open}
          onClose={() => setOpen(null)}
          onDecided={() => {
            setMessage(`Decision saved for ${open.email}. The borrower has been notified.`)
            setOpen(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

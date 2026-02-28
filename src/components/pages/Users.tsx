"use client"

import { useState, useMemo } from "react"
import { Search, Eye, X, ChevronLeft, ChevronRight, Ban, ShieldCheck, Loader2 } from "lucide-react"
import { UserStatus, type UserProfile } from "@avelon_capstone/types"
import { api } from "@/lib/api"
import { useCachedFetch } from "@/lib/use-cached-fetch"
import { UsersSkeleton } from "@/components/skeletons"

// ── StatusBadge ────────────────────────────────────────────
const statusStyles: Record<UserStatus, string> = {
  [UserStatus.REGISTERED]: "bg-gray-100 text-gray-700",
  [UserStatus.VERIFIED]: "bg-blue-100 text-blue-800",
  [UserStatus.CONNECTED]: "bg-cyan-100 text-cyan-800",
  [UserStatus.PENDING_KYC]: "bg-yellow-100 text-yellow-800",
  [UserStatus.APPROVED]: "bg-green-100 text-green-800",
  [UserStatus.REJECTED]: "bg-red-100 text-red-800",
  [UserStatus.SUSPENDED]: "bg-red-200 text-red-900",
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
      {status.replace("_", " ")}
    </span>
  )
}

// ── UserAvatar ─────────────────────────────────────────────
const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500",
  "bg-pink-500", "bg-indigo-500", "bg-red-500", "bg-teal-500",
]

function UserAvatar({ name }: { name: string | null }) {
  const display = name ?? "?"
  const colorIndex = display.charCodeAt(0) % avatarColors.length
  return (
    <div className={`w-10 h-10 rounded-full ${avatarColors[colorIndex]} flex items-center justify-center text-white font-semibold`}>
      {display.charAt(0).toUpperCase()}
    </div>
  )
}

// ── UserDetailsModal ───────────────────────────────────────
function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onSuspend,
  onUnsuspend,
  isUpdating,
}: {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onSuspend: () => void
  onUnsuspend: () => void
  isUpdating: boolean
}) {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl mx-4 bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{user.name ?? user.email}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Verified</span>
                <span className="font-medium">{user.emailVerified ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{user.name ?? "—"}</span>
              </div>
              {user.legalName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Legal Name (KYC)</span>
                  <span className="font-medium">{user.legalName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">KYC Level</span>
                <span className="font-medium">{user.kycLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Credit & Loan Stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Credit &amp; Loan Stats</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Credit Score</span>
                <span className="font-medium">{user.creditScore ?? "—"} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Credit Tier</span>
                <span className="font-medium">{user.creditTier ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Borrowed</span>
                <span className="font-medium">{user.totalBorrowed} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Repaid</span>
                <span className="font-medium">{user.totalRepaid} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Loans</span>
                <span className="font-medium">{user.activeLoansCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions — only Suspend/Unsuspend, NO approve/reject (KYC is AI-only) */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">User ID: {user.id}</p>
          {user.status === UserStatus.SUSPENDED ? (
            <button
              onClick={onUnsuspend}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Unsuspend User
            </button>
          ) : (
            <button
              onClick={onSuspend}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
              Suspend User
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
      <span>
        {totalItems === 0
          ? "Showing 0 of 0 users"
          : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} users`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                page === currentPage ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
const ITEMS_PER_PAGE = 10

export default function Users() {
  const { data: usersData, loading, error, refresh, invalidate } = useCachedFetch<{ users: UserProfile[] }>("/api/v1/admin/users")
  const users = usersData?.users ?? []
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter & paginate
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        (user.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  // Handlers
  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleSuspend = async () => {
    if (!selectedUser) return
    setIsUpdating(true)
    try {
      const result = await api.put<{ message: string }>(
        `/api/v1/admin/users/${selectedUser.id}/status`,
        { status: UserStatus.SUSPENDED },
      )
      if (result.success) {
        invalidate()
        await refresh()
        setIsUserModalOpen(false)
        setSelectedUser(null)
      }
    } catch {
      // Silently handle
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnsuspend = async () => {
    if (!selectedUser) return
    setIsUpdating(true)
    try {
      const result = await api.put<{ message: string }>(
        `/api/v1/admin/users/${selectedUser.id}/status`,
        { status: UserStatus.APPROVED },
      )
      if (result.success) {
        invalidate()
        await refresh()
        setIsUserModalOpen(false)
        setSelectedUser(null)
      }
    } catch {
      // Silently handle
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search users"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | UserStatus)
                setCurrentPage(1)
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All Status</option>
              {Object.values(UserStatus).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <UsersSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">
              Retry
            </button>
          </div>
        )}

        {/* Users Table */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Tier</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found</td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.name} />
                            <span className="font-medium text-gray-900">{user.name ?? "Unnamed"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600">{user.creditScore ?? "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{user.creditTier ?? "—"}</td>
                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            View Details <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedUser(null)
        }}
        onSuspend={handleSuspend}
        onUnsuspend={handleUnsuspend}
        isUpdating={isUpdating}
      />
    </div>
  )
}

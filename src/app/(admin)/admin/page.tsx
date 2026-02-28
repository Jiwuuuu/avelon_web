'use client'

import { TrendingUp, Users, Activity, Zap, DollarSign, BarChart3 } from 'lucide-react'
import { useCachedFetch } from '@/lib/use-cached-fetch'
import { useRouter } from 'next/navigation'
import { DashboardSkeleton } from '@/components/skeletons'

type AnalyticsData = {
    users: { total: number; verified: number; approved: number; pending: number }
    loans: { total: number; active: number; repaid: number; liquidated: number; totalVolume: number }
    treasury: { balance: number; totalLent: number; totalInterestEarned: number; totalFees: number }
    recentActivity: { type: string; message: string; createdAt: string }[]
}

export default function AdminDashboardPage() {
    const { data: analytics, loading, error, refresh } = useCachedFetch<AnalyticsData>('/api/v1/admin/analytics')
    const router = useRouter()

    if (loading) return <DashboardSkeleton />

    if (error) {
        return (
            <div className="bg-gray-50 min-h-full p-8">
                <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
                    <p className="text-red-700 font-medium">{error}</p>
                    <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold">Retry</button>
                </div>
            </div>
        )
    }

    if (!analytics) return null
    const data = analytics
    const totalLoanVolume = Number(data.loans.totalVolume ?? 0)

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <TrendingUp size={14} />
                            <span>TOTAL LOAN VOLUME</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">{totalLoanVolume.toFixed(2)} ETH</div>
                                <div className="text-gray-500 text-sm mt-1">{data.loans.total} loans</div>
                            </div>
                            <div className="text-yellow-500"><DollarSign size={24} /></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <Users size={14} />
                            <span>USERS</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">{data.users.total.toLocaleString()}</div>
                                <div className="text-green-500 text-sm font-medium mt-1">{data.users.approved} approved</div>
                            </div>
                            <div className="text-blue-500"><Users size={24} /></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <Activity size={14} />
                            <span>ACTIVE LOANS</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">{data.loans.active}</div>
                                <div className="text-gray-500 text-sm mt-1">{data.loans.repaid} repaid</div>
                            </div>
                            <div className="text-purple-500"><BarChart3 size={24} /></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <DollarSign size={14} />
                            <span>TREASURY</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">{Number(data.treasury.balance).toFixed(2)} ETH</div>
                                <div className="text-gray-500 text-sm mt-1">
                                    {Number(data.treasury.totalInterestEarned).toFixed(4)} interest earned
                                </div>
                            </div>
                            <div className="text-orange-500"><TrendingUp size={24} /></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {(data.recentActivity ?? []).length === 0 && (
                                <p className="text-sm text-gray-500">No recent activity.</p>
                            )}
                            {(data.recentActivity ?? []).slice(0, 8).map((event, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{event.message}</div>
                                        <div className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Status & Quick Actions */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Overview</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                    <Zap className="text-green-500" size={18} />
                                    <span className="text-sm font-medium">Smart Contracts</span>
                                </div>
                                <span className="text-xs text-green-600 font-medium">LIVE</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                    <Activity className="text-green-500" size={18} />
                                    <span className="text-sm font-medium">AI KYC Verification</span>
                                </div>
                                <span className="text-xs text-green-600 font-medium">ACTIVE</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <span className="text-sm">Pending KYC: <strong>{data.users.pending}</strong></span>
                                <span className="text-sm">Verified Users: <strong>{data.users.verified}</strong></span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <span className="text-sm">Liquidated: <strong>{data.loans.liquidated}</strong></span>
                                <span className="text-sm">Fees Earned: <strong>{Number(data.treasury.totalFees).toFixed(4)} ETH</strong></span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
                            <button
                                onClick={() => router.push('/admin/loan-requests')}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg mb-2 transition"
                            >
                                View Active Loans ({data.loans.active})
                            </button>
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition"
                            >
                                Manage Users ({data.users.total})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

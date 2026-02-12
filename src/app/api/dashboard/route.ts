/**
 * GET /api/dashboard
 * Proxies to: GET /api/v1/admin/analytics
 * Returns platform-wide dashboard metrics for the admin panel.
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

export async function GET(request: Request) {
  const result = await proxyToBackend({
    backendPath: '/api/v1/admin/analytics',
    request,
  })

  if (result?.success) {
    return jsonResponse(result.data)
  }

  // Mock fallback — used when backend is unavailable
  const mock = {
    users: {
      total: 150,
      verified: 120,
      approved: 95,
      pending: 30,
    },
    loans: {
      total: 85,
      active: 42,
      repaid: 38,
      liquidated: 5,
      totalVolume: '2500000',
    },
    treasury: {
      balance: '500000',
      totalLent: '1800000',
      totalInterestEarned: '125000',
      totalFees: '18500',
    },
    recentActivity: [],
  }

  return jsonResponse(mock)
}
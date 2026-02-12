/**
 * /api/completed-loans
 * Proxies to: /api/v1/admin/loans (filtered by status)
 * View completed/repaid loans (admin view).
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

/**
 * GET /api/completed-loans
 * List completed loans
 * Backend: GET /api/v1/admin/loans?status=repaid
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // Always filter for repaid loans
  searchParams.set('status', 'repaid')
  const query = searchParams.toString()

  const result = await proxyToBackend({
    backendPath: '/api/v1/admin/loans',
    request,
    query,
  })

  if (result?.success) {
    return jsonResponse(result.data)
  }

  // Mock fallback
  const mock = {
    loans: [
      { id: 'loan_1', userId: 'user_1', amount: '5000', totalInterest: '625', status: 'repaid', completedDate: '2026-01-15' },
      { id: 'loan_2', userId: 'user_2', amount: '10000', totalInterest: '1500', status: 'repaid', completedDate: '2026-01-20' },
      { id: 'loan_3', userId: 'user_3', amount: '3000', totalInterest: '225', status: 'repaid', completedDate: '2026-02-05' },
    ],
    meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
  }

  return jsonResponse(mock)
}

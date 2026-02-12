/**
 * /api/loan-status
 * Proxies to: /api/v1/loans (with status info)
 * View active loans and their repayment progress.
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

/**
 * GET /api/loan-status
 * List loans with status/progress info
 * Backend: GET /api/v1/loans
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()

  const result = await proxyToBackend({
    backendPath: '/api/v1/loans',
    request,
    query,
  })

  if (result?.success) {
    return jsonResponse(result.data)
  }

  // Mock fallback
  const mock = [
    { id: 'loan_1', userId: 'user_1', amount: '5000', status: 'active', progress: 65, nextPayment: '2026-02-20' },
    { id: 'loan_2', userId: 'user_2', amount: '10000', status: 'active', progress: 40, nextPayment: '2026-02-25' },
    { id: 'loan_3', userId: 'user_3', amount: '3000', status: 'repaid', progress: 100, nextPayment: null },
  ]

  return jsonResponse(mock)
}

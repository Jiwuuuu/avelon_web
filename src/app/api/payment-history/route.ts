/**
 * /api/payment-history
 * Proxies to: /api/v1/loans/:id/transactions
 * View payment history for loans.
 *
 * Query params:
 *   - loanId: specific loan to get payments for
 *   - Without loanId: returns all loans (caller should aggregate)
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/payment-history?loanId=xxx
 * Get payment/transaction history for a specific loan
 * Backend: GET /api/v1/loans/:id/transactions
 *          GET /api/v1/loans (if no loanId, returns all loans)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loanId = searchParams.get('loanId')

  // A specific loan gets its own transactions; without one, the admin loan list.
  const result = loanId
    ? await proxyToBackend({
        backendPath: `/api/v1/loans/${loanId}/transactions`,
        request,
      })
    : await proxyToBackend({
        backendPath: '/api/v1/admin/loans',
        request,
        query: searchParams.toString(),
      })

  if (result?.success) {
    return jsonResponse(result.data)
  }

  // No mock fallback. An unreachable backend or a rejected request has to
  // surface as an error — returning invented figures here meant a failed call
  // rendered as real platform totals.
  if (!result) return errorResponse('Backend unavailable', 502)
  return errorResponse(result.error ?? 'Request failed', result.status)
}

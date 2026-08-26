/**
 * /api/transaction-history
 * Proxies to: /api/v1/loans/:id/transactions
 * View blockchain/on-chain transaction history.
 *
 * Query params:
 *   - loanId: specific loan to get transactions for
 *   - Without loanId: returns all loans overview
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/transaction-history?loanId=xxx
 * Get transaction history for a specific loan
 * Backend: GET /api/v1/loans/:id/transactions
 *          GET /api/v1/loans (if no loanId)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loanId = searchParams.get('loanId')

  // A specific loan gets its own transactions; without one, the chain overview.
  const result = loanId
    ? await proxyToBackend({
        backendPath: `/api/v1/loans/${loanId}/transactions`,
        request,
      })
    : await proxyToBackend({
        backendPath: '/api/v1/loans/blockchain/status',
        request,
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

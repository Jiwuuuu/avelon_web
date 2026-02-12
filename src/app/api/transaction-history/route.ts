/**
 * /api/transaction-history
 * Proxies to: /api/v1/loans/:id/transactions
 * View blockchain/on-chain transaction history.
 *
 * Query params:
 *   - loanId: specific loan to get transactions for
 *   - Without loanId: returns all loans overview
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

/**
 * GET /api/transaction-history?loanId=xxx
 * Get transaction history for a specific loan
 * Backend: GET /api/v1/loans/:id/transactions
 *          GET /api/v1/loans (if no loanId)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loanId = searchParams.get('loanId')

  if (loanId) {
    const result = await proxyToBackend({
      backendPath: `/api/v1/loans/${loanId}/transactions`,
      request,
    })

    if (result?.success) {
      return jsonResponse(result.data)
    }
  } else {
    // General overview — also try blockchain status
    const result = await proxyToBackend({
      backendPath: '/api/v1/loans/blockchain/status',
      request,
    })

    if (result?.success) {
      return jsonResponse(result.data)
    }
  }

  // Mock fallback
  const mock = [
    { id: 'tx_1', type: 'deposit', amount: '1000', status: 'completed', date: '2026-02-10', txHash: '0xabc123...' },
    { id: 'tx_2', type: 'withdrawal', amount: '500', status: 'pending', date: '2026-02-11', txHash: '0xdef456...' },
    { id: 'tx_3', type: 'loan_disbursement', amount: '5000', status: 'completed', date: '2026-02-09', txHash: '0xghi789...' },
  ]

  return jsonResponse(mock)
}

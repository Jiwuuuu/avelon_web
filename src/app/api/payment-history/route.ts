/**
 * /api/payment-history
 * Proxies to: /api/v1/loans/:id/transactions
 * View payment history for loans.
 *
 * Query params:
 *   - loanId: specific loan to get payments for
 *   - Without loanId: returns all loans (caller should aggregate)
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

/**
 * GET /api/payment-history?loanId=xxx
 * Get payment/transaction history for a specific loan
 * Backend: GET /api/v1/loans/:id/transactions
 *          GET /api/v1/loans (if no loanId, returns all loans)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loanId = searchParams.get('loanId')

  // If a specific loan ID is provided, get its transactions
  if (loanId) {
    const result = await proxyToBackend({
      backendPath: `/api/v1/loans/${loanId}/transactions`,
      request,
    })

    if (result?.success) {
      return jsonResponse(result.data)
    }
  } else {
    // No specific loan — get all loans (admin view)
    const result = await proxyToBackend({
      backendPath: '/api/v1/admin/loans',
      request,
      query: searchParams.toString(),
    })

    if (result?.success) {
      return jsonResponse(result.data)
    }
  }

  // Mock fallback
  const mock = [
    { id: 'pm_1', loanId: 'loan_1', amount: '500', dueDate: '2026-02-15', status: 'paid', paidDate: '2026-02-10' },
    { id: 'pm_2', loanId: 'loan_2', amount: '750', dueDate: '2026-02-20', status: 'pending', paidDate: null },
  ]

  return jsonResponse(mock)
}

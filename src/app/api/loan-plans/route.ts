/**
 * /api/loan-plans
 * Proxies to: /api/v1/plans
 * List and view available loan plans.
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

/**
 * GET /api/loan-plans
 * List all loan plans
 * Backend: GET /api/v1/plans
 */
export async function GET(request: Request) {
  const result = await proxyToBackend({
    backendPath: '/api/v1/plans',
    request,
  })

  if (result?.success) {
    return jsonResponse(result.data)
  }

  // Mock fallback
  const mock = [
    { id: 'basic', name: 'Basic Loan', interestRate: 5.5, termMonths: 12, minAmount: '1000', maxAmount: '10000' },
    { id: 'standard', name: 'Standard Loan', interestRate: 8.5, termMonths: 24, minAmount: '5000', maxAmount: '50000' },
    { id: 'premium', name: 'Premium Loan', interestRate: 12, termMonths: 36, minAmount: '10000', maxAmount: '100000' },
  ]

  return jsonResponse(mock)
}
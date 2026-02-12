/**
 * /api/loan-requests
 * Proxies to: /api/v1/loans
 * Create and list loan requests.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/loan-requests
 * List loans (user's own loans)
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
    { id: 'lr_1', userId: 'user_1', amount: '5000', planId: 'basic', status: 'pending', createdAt: '2026-02-10' },
    { id: 'lr_2', userId: 'user_2', amount: '15000', planId: 'standard', status: 'approved', createdAt: '2026-02-08' },
  ]

  return jsonResponse(mock)
}

/**
 * POST /api/loan-requests
 * Create a new loan request
 * Backend: POST /api/v1/loans
 * Body: { planId, collateralAmount, walletId }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await proxyToBackend({
      backendPath: '/api/v1/loans',
      request,
      method: 'POST',
      body,
    })

    if (result) {
      return jsonResponse(result.data, result.success, result.status, result.error)
    }

    const created = { id: `lr_${Date.now()}`, ...body, status: 'pending' }
    return jsonResponse(created)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return errorResponse(message)
  }
}
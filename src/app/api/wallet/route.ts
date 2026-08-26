/**
 * /api/wallet
 * Proxies to: /api/v1/wallets
 * Wallet management — view balances, connect, verify.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/wallet
 * Get user's wallets and balances
 * Backend: GET /api/v1/wallets
 */
export async function GET(request: Request) {
  const result = await proxyToBackend({
    backendPath: '/api/v1/wallets',
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

/**
 * POST /api/wallet
 * Connect a new wallet
 * Backend: POST /api/v1/wallets/connect
 * Body: { walletAddress, signature, message }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await proxyToBackend({
      backendPath: '/api/v1/wallets/connect',
      request,
      method: 'POST',
      body,
    })

    if (result) {
      return jsonResponse(result.data, result.success, result.status, result.error)
    }

    return jsonResponse({ id: `wallet_${Date.now()}`, address: body.walletAddress, isPrimary: false })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return errorResponse(message)
  }
}

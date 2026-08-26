/**
 * /api/deposits
 * Proxies to: /api/v1/wallets (wallet deposits/balances)
 * View deposit activity — maps to wallet balance data.
 *
 * NOTE: The backend doesn't have a dedicated "deposits" endpoint.
 * This route aggregates data from wallet endpoints.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/deposits
 * List deposits — proxied from wallet balances
 * Backend: GET /api/v1/wallets/balances/all
 */
export async function GET(request: Request) {
  const result = await proxyToBackend({
    backendPath: '/api/v1/wallets/balances/all',
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

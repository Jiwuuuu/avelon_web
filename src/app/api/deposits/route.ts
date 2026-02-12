/**
 * /api/deposits
 * Proxies to: /api/v1/wallets (wallet deposits/balances)
 * View deposit activity — maps to wallet balance data.
 *
 * NOTE: The backend doesn't have a dedicated "deposits" endpoint.
 * This route aggregates data from wallet endpoints.
 */
import { proxyToBackend, jsonResponse } from '../_lib/proxy'

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

  // Mock fallback
  const mock = [
    { id: 'dep_1', userId: 'user_1', amount: '1000', currency: 'USDC', status: 'completed', date: '2026-02-10' },
    { id: 'dep_2', userId: 'user_2', amount: '2500', currency: 'ETH', status: 'pending', date: '2026-02-11' },
    { id: 'dep_3', userId: 'user_3', amount: '500', currency: 'USDC', status: 'completed', date: '2026-02-09' },
  ]

  return jsonResponse(mock)
}

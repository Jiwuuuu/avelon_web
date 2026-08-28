/**
 * GET /api/dashboard
 * Proxies to: GET /api/v1/admin/analytics
 * Returns platform-wide dashboard metrics for the admin panel.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

export async function GET(request: Request) {
  const result = await proxyToBackend({
    backendPath: '/api/v1/admin/analytics',
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
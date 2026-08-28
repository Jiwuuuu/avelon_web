/**
 * /api/completed-loans
 * Proxies to: /api/v1/admin/loans (filtered by status)
 * View completed/repaid loans (admin view).
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/completed-loans
 * List completed loans
 * Backend: GET /api/v1/admin/loans?status=repaid
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // Always filter for repaid loans
  searchParams.set('status', 'REPAID')
  const query = searchParams.toString()

  const result = await proxyToBackend({
    backendPath: '/api/v1/admin/loans',
    request,
    query,
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

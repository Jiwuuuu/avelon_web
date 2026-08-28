/**
 * /api/loan-status
 * Proxies to: /api/v1/loans (with status info)
 * View active loans and their repayment progress.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/loan-status
 * List loans with status/progress info
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

  // No mock fallback. An unreachable backend or a rejected request has to
  // surface as an error — returning invented figures here meant a failed call
  // rendered as real platform totals.
  if (!result) return errorResponse('Backend unavailable', 502)
  return errorResponse(result.error ?? 'Request failed', result.status)
}

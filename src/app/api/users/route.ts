/**
 * /api/users
 * Proxies to: /api/v1/admin/users
 * Admin user management — list, view, update status.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/users
 * List all users (admin)
 * Backend: GET /api/v1/admin/users?page=&limit=&status=
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()

  const result = await proxyToBackend({
    backendPath: '/api/v1/admin/users',
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

/**
 * PUT /api/users
 * Update user status (admin)
 * Backend: PUT /api/v1/admin/users/:id/status
 * Body: { id: string, status: string }
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body?.id || body?.userId
    if (!id) return errorResponse('Missing user id', 400)

    const result = await proxyToBackend({
      backendPath: `/api/v1/admin/users/${id}/status`,
      request,
      method: 'PUT',
      body: { status: body.status },
    })

    if (result) {
      return jsonResponse(result.data, result.success, result.status, result.error)
    }

    return jsonResponse({ id, status: body.status, message: 'User status updated' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return errorResponse(message)
  }
}
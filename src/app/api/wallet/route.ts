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

  // Mock fallback
  const mock = {
    wallets: [
      {
        id: 'wallet_1',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42471',
        isPrimary: true,
        isVerified: true,
      },
    ],
    totalBalance: {
      USDC: '10000',
      ETH: '1.5',
    },
  }

  return jsonResponse(mock)
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

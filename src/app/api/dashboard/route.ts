import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || ''

export async function GET(request: Request) {
  try {
    // If a backend URL is configured, try to proxy the request
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/dashboard/metrics`, {
        headers: { accept: 'application/json', ...(Object.fromEntries(request.headers)) },
        method: 'GET',
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ success: true, data })
      }
      // fallthrough to mock data on non-ok response
    }
  } catch (err) {
    // ignore and return mock data
  }

  // Mock response (safe fallback)
  const mock = {
    totalLoans: 6900000,
    totalLoansLabel: '$6.9M',
    totalLoansChange: 12.5,
    activeUsers: 66969,
    activeUsersChange: 6.9,
    aiRiskAvg: 8.9,
    aiRiskChange: 8.1,
    pendingReviews: 20,
  }

  return NextResponse.json({ success: true, data: mock })
}
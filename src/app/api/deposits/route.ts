import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || ''

export async function GET(request: Request) {
  try {
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/deposits`, {
        headers: { accept: 'application/json', ...(Object.fromEntries(request.headers)) },
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ success: true, data })
      }
    }
  } catch (err) {}

  const mock = [
    { id: 'dep_1', userId: 'user_1', amount: 1000, currency: 'USDC', status: 'completed', date: '2026-02-10' },
    { id: 'dep_2', userId: 'user_2', amount: 2500, currency: 'ETH', status: 'pending', date: '2026-02-11' },
    { id: 'dep_3', userId: 'user_3', amount: 500, currency: 'USDC', status: 'completed', date: '2026-02-09' },
  ]

  return NextResponse.json({ success: true, data: mock })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/deposits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(Object.fromEntries(request.headers)) },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, data })
    }

    const created = { id: `dep_${Date.now()}`, ...body, status: 'pending', date: new Date().toISOString().split('T')[0] }
    return NextResponse.json({ success: true, data: created })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: (err && err.message) || 'Unknown error' }, { status: 500 })
  }
}

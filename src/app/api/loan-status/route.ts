import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || ''

export async function GET(request: Request) {
  try {
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/loan-status`, {
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
    { id: 'loan_1', userId: 'user_1', amount: 5000, status: 'active', progress: 65, nextPayment: '2026-02-20' },
    { id: 'loan_2', userId: 'user_2', amount: 10000, status: 'active', progress: 40, nextPayment: '2026-02-25' },
    { id: 'loan_3', userId: 'user_3', amount: 3000, status: 'completed', progress: 100, nextPayment: null },
  ]

  return NextResponse.json({ success: true, data: mock })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/loan-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(Object.fromEntries(request.headers)) },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, data })
    }

    const created = { id: `loan_${Date.now()}`, ...body, status: 'pending', progress: 0 }
    return NextResponse.json({ success: true, data: created })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: (err && err.message) || 'Unknown error' }, { status: 500 })
  }
}

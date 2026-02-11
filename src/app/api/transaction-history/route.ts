import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || ''

export async function GET(request: Request) {
  try {
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/transaction-history`, {
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
    { id: 'tx_1', type: 'deposit', amount: 1000, status: 'completed', date: '2026-02-10', hash: 'hash_123' },
    { id: 'tx_2', type: 'withdrawal', amount: 500, status: 'pending', date: '2026-02-11', hash: 'hash_456' },
    { id: 'tx_3', type: 'loan_disbursement', amount: 5000, status: 'completed', date: '2026-02-09', hash: 'hash_789' },
  ]

  return NextResponse.json({ success: true, data: mock })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/transaction-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(Object.fromEntries(request.headers)) },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, data })
    }

    const created = { id: `tx_${Date.now()}`, ...body, status: 'pending', date: new Date().toISOString().split('T')[0] }
    return NextResponse.json({ success: true, data: created })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: (err && err.message) || 'Unknown error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || ''

export async function GET(request: Request) {
  try {
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/users`, {
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
    { id: 'user_1', name: 'Will', email: 'will@example.com', role: 'admin' },
    { id: 'user_2', name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
  ]

  return NextResponse.json({ success: true, data: mock })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(Object.fromEntries(request.headers)) },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, data })
    }

    const created = { id: `user_${Date.now()}`, ...body }
    return NextResponse.json({ success: true, data: created })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: (err && err.message) || 'Unknown error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = (body && (body.id || body.userId)) || null
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(Object.fromEntries(request.headers)) },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, data })
    }

    const updated = { id, ...body }
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: (err && err.message) || 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const id = (body && (body.id || body.userId)) || null
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    if (BACKEND) {
      const res = await fetch(`${BACKEND}/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(Object.fromEntries(request.headers)) },
      })
      if (res.ok) return NextResponse.json({ success: true })
      const data = await res.json()
      return NextResponse.json({ success: false, error: data })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: (err && err.message) || 'Unknown error' }, { status: 500 })
  }
}
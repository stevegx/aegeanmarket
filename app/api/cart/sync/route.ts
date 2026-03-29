import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Εδώ θα μπει αργότερα η MongoDB
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

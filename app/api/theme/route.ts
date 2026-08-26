import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import User from '@/models/User'

const VALID_THEMES = ['light', 'dark', 'system']

export async function GET() {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const user = await User.findById(session.userId).select(
      'themePreference'
    )
    return NextResponse.json({ theme: user?.themePreference ?? 'system' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { theme } = await req.json()
    if (!VALID_THEMES.includes(theme))
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    await connectDB()
    await User.findByIdAndUpdate(session.userId, { themePreference: theme })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

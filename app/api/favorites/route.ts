import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const user = await User.findById(session.userId).select('favorites')
    return NextResponse.json({
      ids: (user?.favorites || []).map((id: { toString: () => string }) =>
        id.toString()
      ),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

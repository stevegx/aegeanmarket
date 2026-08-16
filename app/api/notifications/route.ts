import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import { getUserNotifications } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { notifications, unreadCount } = await getUserNotifications(
      session.userId
    )
    return NextResponse.json({ notifications, unreadCount })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

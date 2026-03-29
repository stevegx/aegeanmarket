import { getSession } from '@/app/actions//getSession'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = payload.role as string
    if (pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register/:path*'],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

function isAdminPath(pathname: string) {
  return pathname === '/adminpage' || pathname.startsWith('/adminpage/')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // --- 1. ΠΡΟΣΠΑΘΕΙΑ VERIFY ΤΟΥ AUTH TOKEN ---
  let payload = null
  if (authToken) {
    try {
      const verified = await jwtVerify(authToken, JWT_SECRET)
      payload = verified.payload
    } catch (err) {
      payload = null // Έληξε ή είναι άκυρο
    }
  }

  // --- 2. ΑΝ ΕΙΝΑΙ ΛΗΓΜΕΝΟ ΑΛΛΑ ΕΧΟΥΜΕ REFRESH TOKEN (ΑΝΑΝΕΩΣΗ) ---
  if (!payload && refreshToken) {
    try {
      const { payload: refreshPayload } = await jwtVerify(
        refreshToken,
        REFRESH_SECRET
      )

      const newAccessToken = await new SignJWT({
        userId: refreshPayload.userId,
        username: refreshPayload.username,
        role: refreshPayload.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(JWT_SECRET)

      // Δημιουργούμε το response και βάζουμε το ΝΕΟ cookie
      const response = NextResponse.next()
      response.cookies.set('auth_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 15,
        path: '/',
      })

      // Αν είναι ήδη συνδεδεμένος και πάει login/register, στείλτον αρχική
      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response
    } catch (err) {
      // Αν και το refresh απέτυχε, καθάρισε τα πάντα
      const response = NextResponse.next()
      response.cookies.delete('auth_token')
      response.cookies.delete('refresh_token')
      return response
    }
  }

  // --- 3. ΠΡΟΣΤΑΣΙΑ ΔΙΑΔΡΟΜΩΝ (RBAC) ---

  // Αν δεν είναι συνδεδεμένος και πάει Admin
  if (!payload && isAdminPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Αν είναι συνδεδεμένος και πάει Login/Register
  if (
    payload &&
    (pathname.startsWith('/login') || pathname.startsWith('/register'))
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Αν πάει Admin αλλά δεν είναι Admin
  if (payload && isAdminPath(pathname) && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/adminpage/:path*',
    '/login',
    '/register',
    '/profile/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Αυτό τρέχει παντού εκτός από αρχεία
  ],
}

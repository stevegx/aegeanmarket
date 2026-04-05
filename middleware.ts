import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // --- 1. ΠΕΡΙΠΤΩΣΗ: ΔΕΝ ΥΠΑΡΧΕΙ AUTH TOKEN ---
  if (!authToken) {
    // Αν δεν έχει auth_token αλλά έχει REFRESH, προσπάθησε να βγάλεις νέο
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET)

        // Δημιουργία νέου Access Token (15 λεπτά)
        const newAccessToken = await new SignJWT({
          userId: payload.userId,
          username: payload.username, // Σιγουρέψου ότι το έβαλες στο refresh token κατά το login
          role: payload.role,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('15m')
          .sign(JWT_SECRET)

        // Φτιάχνουμε την απάντηση
        const response = NextResponse.next()

        // Βάζουμε το νέο cookie
        response.cookies.set('auth_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 15,
          path: '/',
        })

        // Αν προσπαθεί να μπει σε login/register ενώ μόλις τον κάναμε refresh, στείλτον αρχική
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
          return NextResponse.redirect(new URL('/', request.url))
        }

        return response
      } catch (err) {
        // Αν και το refresh token είναι άκυρο/ληγμένο
        if (pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/login', request.url))
        }
      }
    }

    // Αν δεν έχει καθόλου tokens και πάει admin
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // --- 2. ΠΕΡΙΠΤΩΣΗ: ΥΠΑΡΧΕΙ AUTH TOKEN (Έλεγχος Ρόλων) ---
  try {
    const { payload } = await jwtVerify(authToken, JWT_SECRET)
    const userRole = payload.role as string

    if (pathname.startsWith('/register') || pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (error) {
    // Αν το token είναι ληγμένο/άκυρο, καθάρισέ το και άσε το επόμενο request
    // να προσπαθήσει το refresh (ή στείλτον login αν είναι admin)
    const response = NextResponse.redirect(
      new URL(pathname.startsWith('/admin') ? '/login' : '/', request.url)
    )
    response.cookies.delete('auth_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register/:path*'],
}

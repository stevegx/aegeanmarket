'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { loginWithGoogle } from '@/app/actions/loginWithGoogle'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string>
          ) => void
        }
      }
    }
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
}: {
  onSuccess: (username: string) => void
  onError: (message: string) => void
}) {
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!ready || !window.google || !clientId || !containerRef.current) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        const result = await loginWithGoogle(response.credential)
        if (result.success) onSuccess(result.username)
        else onError(result.error || 'Google sign-in failed.')
      },
    })
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      width: '384',
      text: 'continue_with',
    })
  }, [ready, clientId, onSuccess, onError])

  if (!clientId) return null

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        // onReady (not onLoad) fires on first load AND on every subsequent
        // remount. onLoad only fires once, so after a client-side nav away
        // and back (e.g. Google login -> logout -> /login) the button would
        // never re-render.
        onReady={() => setReady(true)}
      />
      <div ref={containerRef} className="flex w-full justify-center" />
    </>
  )
}

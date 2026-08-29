'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const CONSENT_KEY = 'aegean-cookie-consent'

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) return
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)))
  }, [])

  function respond(choice: 'accepted' | 'rejected') {
    localStorage.setItem(CONSENT_KEY, choice)
    setAnimateIn(false)
    setTimeout(() => setMounted(false), 300)
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center p-4 md:p-6 pointer-events-none">
      <div
        className={`pointer-events-auto max-w-3xl w-full rounded-3xl border border-white/15 bg-aegean-dark/75 backdrop-blur-xl backdrop-saturate-150 shadow-2xl shadow-black/40 p-6 md:p-7 flex flex-col md:flex-row items-center gap-5 md:gap-8 transition-all duration-300 ease-out ${
          animateIn
            ? 'translate-y-0 opacity-100'
            : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="flex items-center gap-4 flex-1 text-center md:text-left">
          <span className="hidden md:flex shrink-0 h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            🍪
          </span>
          <p className="text-sm md:text-[0.95rem] text-white/90 leading-relaxed">
            We use essential cookies to keep you signed in. This is a
            personal project &mdash; we don&apos;t sell or share your data.
            See our{' '}
            <Link
              href="/cookies"
              className="underline underline-offset-2 decoration-white/40 hover:text-white hover:decoration-white"
            >
              Cookies Policy
            </Link>{' '}
            for details.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            size="lg"
            className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            onClick={() => respond('rejected')}
          >
            Reject
          </Button>
          <Button
            size="lg"
            className="bg-white text-aegean-dark font-semibold hover:bg-white/90"
            onClick={() => respond('accepted')}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

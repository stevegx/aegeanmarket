import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookies Policy',
  description:
    'Information on how The Aegean Market uses cookies and how your data is handled.',
}

export default function CookiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Cookies Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          This page explains what cookies our website uses, why we use them,
          and how your data is treated.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-aegean-green/10 p-3 rounded-xl">
              <span className="text-2xl">🍪</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              What Cookies We Use
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We only use <span className="font-bold">essential cookies</span>{' '}
              required for the site to work properly &mdash; no advertising or
              third-party tracking cookies are set.
            </p>
            <ul className="list-disc ml-5 space-y-2">
              <li>
                <span className="text-foreground font-semibold">
                  auth_token
                </span>{' '}
                &mdash; keeps you signed in (expires after 5 minutes, then is
                silently refreshed).
              </li>
              <li>
                <span className="text-foreground font-semibold">
                  refresh_token
                </span>{' '}
                &mdash; lets you stay logged in between visits (expires after
                7 days).
              </li>
              <li>
                Your cart is saved in your browser&apos;s local storage, not
                in a cookie, so it stays on your device only.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-aegean-green/10 p-3 rounded-xl">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              How Your Data Is Handled
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The Aegean Market is a{' '}
              <span className="font-bold text-foreground">
                personal, non-commercial project
              </span>
              , not a company.
            </p>
            <ul className="list-disc ml-5 space-y-2">
              <li>
                We do not sell, share, or distribute any of your data to
                third parties.
              </li>
              <li>
                Cookies are used solely to keep you logged in &mdash; nothing
                is used for advertising or analytics tracking.
              </li>
              <li>
                Your account data is stored only for as long as needed to
                operate the site, and you may request its deletion at any
                time.
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 bg-aegean-dark text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">✅</span> Managing Cookies
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-3xl">
              Because these cookies are essential, disabling them in your
              browser will sign you out and prevent you from staying logged
              in. You can clear or block them at any time through your
              browser&apos;s settings &mdash; the site will still work for
              browsing and shopping as a guest.
            </p>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 inline-block">
              <p className="font-semibold italic text-aegean-green">
                * This is a personal project built for learning purposes and
                does not sell or share user data with anyone.
              </p>
            </div>
          </div>

          <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-bold">
            🍪
          </div>
        </div>
      </div>

      <div className="mt-16 text-center bg-muted p-10 rounded-3xl border border-dashed border-border">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Still have questions?
        </h3>
        <p className="text-muted-foreground mb-6">
          Reach out if you&apos;d like more information about how cookies or
          your data are handled.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
          <h4 className="font-medium text-lg">
            Contact us at:{' '}
            <span className="font-semibold text-aegean-green-text dark:text-aegean-green">
              {' +30 691 234 5678'}
            </span>
          </h4>
          <span className="font-bold text-2xl text-foreground">OR</span>
          <h4 className="font-medium text-lg">
            Email us at:{' '}
            <span className="font-semibold text-aegean-green-text dark:text-aegean-green">
              stevevetsikas85@gmail.com
            </span>
          </h4>
        </div>
      </div>
    </div>
  )
}

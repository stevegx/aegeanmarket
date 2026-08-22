import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Returns & Cancellations',
  description:
    "Everything you need to know about Aegean Market's order cancellation and return policies.",
}

export default function ReturnsPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark mb-4">
          Returns & Cancellations
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We want you to be completely satisfied with your purchase from The
          Aegean Market. Here is everything you need to know about our policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-aegean-green/10 p-3 rounded-xl">
              <span className="text-2xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-aegean-dark">
              Order Cancellation
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              You can cancel your order at{' '}
              <span className="font-bold">no cost</span> if it has not yet been
              dispatched from our warehouse.
            </p>
            <ul className="list-disc ml-5 space-y-2">
              <li>
                To cancel, please call us at{' '}
                <span className="text-aegean-dark font-semibold">
                  +30 22510 12345
                </span>{' '}
                immediately.
              </li>
              <li>
                If the order has already been shipped, you will need to follow
                the return process instead.
              </li>
              <li>
                Refunds for cancelled orders are processed within 3-5 business
                days.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-aegean-green/10 p-3 rounded-xl">
              <span className="text-2xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-aegean-dark">
              Return Policy
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              You have the right to return your products within{' '}
              <span className="font-bold text-aegean-dark">14 days</span> of
              delivery.
            </p>
            <ul className="list-disc ml-5 space-y-2">
              <li>
                Items must be <span className="italic">unopened</span> and in
                their original packaging with all seals intact.
              </li>
              <li>
                For safety reasons, we cannot accept returns on bottles that
                have been opened or tampered with.
              </li>
              <li>
                Return shipping costs are covered by the customer, unless the
                item is defective.
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 bg-aegean-dark text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">🍾</span> Damaged or Wrong Items
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-3xl">
              Despite our specialized packaging, accidents can happen. If you
              receive a broken bottle or the wrong product, we will replace it
              immediately at{' '}
              <span className="font-bold underline">no extra cost</span> to you.
            </p>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 inline-block">
              <p className="font-semibold italic text-aegean-green">
                * Please take a photo of the damaged package/bottle and send it
                to info@mytilene.com within 24 hours.
              </p>
            </div>
          </div>

          <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-bold">
            !
          </div>
        </div>
      </div>

      <div className="mt-16 text-center bg-muted p-10 rounded-3xl border border-dashed border-border">
        <h3 className="text-xl font-bold text-aegean-dark mb-2">
          Still have questions?
        </h3>
        <p className="text-muted-foreground mb-6">
          Our team is here to help you with the return process.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
          <h4 className="font-medium text-lg">
            Contact us at:{' '}
            <span className="font-semibold text-aegean-green-text">
              {' +3069505939532959'}
            </span>
          </h4>
          <span className="font-bold text-2xl text-aegean-dark">OR</span>
          <h4 className="font-medium text-lg">
            Email us at:{' '}
            <span className="font-semibold text-aegean-green-text">
              stevevetsikas85@gmail.com
            </span>
          </h4>
        </div>
      </div>
    </div>
  )
}

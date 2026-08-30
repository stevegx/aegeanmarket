import Stripe from 'stripe'

// Lazily instantiated so the Stripe constructor never runs at module-eval time.
// Vercel's build imports route modules (e.g. /api/webhooks/stripe) to collect
// their config while STRIPE_SECRET_KEY is not in the environment, and
// `new Stripe(undefined)` throws. Deferring construction to the first property
// access means it only runs at request time, when the key is present.
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(key)
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver)
  },
})

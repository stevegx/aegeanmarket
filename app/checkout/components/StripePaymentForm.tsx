'use client'

import { forwardRef, useImperativeHandle } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

type CreateIntentResult =
  | { success: true; orderId: string; clientSecret: string; amount: number }
  | { success: false; error: string }

export type ConfirmPaymentResult =
  | { success: true; orderId: string }
  | { success: false; error: string }

export interface StripePaymentFormHandle {
  // Runs the full deferred-PaymentIntent flow: validate the element, ask the
  // server to create the order + PaymentIntent, then confirm the payment.
  pay: (
    createIntent: () => Promise<CreateIntentResult>
  ) => Promise<ConfirmPaymentResult>
}

const StripePaymentForm = forwardRef<StripePaymentFormHandle>(
  function StripePaymentForm(_props, ref) {
    const stripe = useStripe()
    const elements = useElements()

    useImperativeHandle(ref, () => ({
      async pay(createIntent) {
        if (!stripe || !elements) {
          return { success: false, error: 'Payment form is still loading' }
        }

        const { error: submitError } = await elements.submit()
        if (submitError) {
          return {
            success: false,
            error: submitError.message ?? 'Please check your payment details',
          }
        }

        const intent = await createIntent()
        if (!intent.success) {
          return { success: false, error: intent.error }
        }

        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret: intent.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?orderId=${intent.orderId}`,
          },
          redirect: 'if_required',
        })

        if (error) {
          return {
            success: false,
            error: error.message ?? 'Payment failed',
          }
        }

        return { success: true, orderId: intent.orderId }
      },
    }))

    return <PaymentElement />
  }
)

export default StripePaymentForm

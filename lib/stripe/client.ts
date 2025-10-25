// Stripeクライアント（実際の実装）
import Stripe from "stripe"
import "server-only"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export interface StripeCheckoutSession {
  id: string
  url: string
}

export interface StripeCustomerPortalSession {
  url: string
}

export async function createCheckoutSession(params: {
  customerId?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string>
}): Promise<StripeCheckoutSession> {
  // 実際のStripe API呼び出し
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  })

  return {
    id: session.id,
    url: session.url,
  }
}

export async function createCustomerPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<StripeCustomerPortalSession> {
  // 実際のStripe API呼び出し
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })

  return {
    url: session.url,
  }
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // 実際のStripe署名検証
  const event = stripe.webhooks.constructEvent(payload, signature, secret)
  return event ? true : false
}

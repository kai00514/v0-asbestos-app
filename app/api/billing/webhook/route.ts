import type { NextRequest } from "next/server"
import { handleAPIError, APIError, ErrorCodes } from "@/lib/api/errors"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifyWebhookSignature } from "@/lib/stripe/client"

// POST /api/billing/webhook - Stripe Webhook受信
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "署名が見つかりません")
    }

    // 署名検証
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const isValid = verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "署名検証に失敗しました")
    }

    const event = JSON.parse(body)
    console.log("[v0] Stripe webhook event:", event.type)

    const supabase = await getSupabaseServerClient()

    // イベントタイプ別処理
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const companyId = session.metadata.company_id

        // サブスクリプション開始
        await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: session.subscription,
            status: "active",
          })
          .eq("company_id", companyId)

        console.log("[v0] Subscription activated for company:", companyId)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        const companyId = subscription.metadata.company_id

        // サブスクリプション更新
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        console.log("[v0] Subscription updated:", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object

        // サブスクリプション解約
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        console.log("[v0] Subscription canceled:", subscription.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object
        const subscription = invoice.subscription
        const companyId = invoice.metadata?.company_id

        if (companyId) {
          // 請求書保存
          await supabase.from("invoices").insert({
            company_id: companyId,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100, // セントから円に変換
            currency: invoice.currency,
            status: "paid",
            invoice_date: new Date(invoice.created * 1000).toISOString(),
            paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
          })

          console.log("[v0] Invoice saved:", invoice.id)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        const companyId = invoice.metadata?.company_id

        if (companyId) {
          // 支払い失敗通知
          await supabase.from("notifications").insert({
            company_id: companyId,
            type: "payment_failed",
            title: "支払いに失敗しました",
            message: "クレジットカードの支払いに失敗しました。支払い方法を確認してください。",
          })

          console.log("[v0] Payment failed notification sent for company:", companyId)
        }
        break
      }

      default:
        console.log("[v0] Unhandled webhook event type:", event.type)
    }

    return Response.json({ received: true })
  } catch (error) {
    return handleAPIError(error)
  }
}

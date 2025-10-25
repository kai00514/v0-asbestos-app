"use server"

import { stripe } from "@/lib/stripe/stripe"
import { getProductById } from "@/lib/stripe/products"
import { requireAuth } from "@/lib/api/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string) {
  // 認証チェック
  const { user } = await requireAuth()

  // 商品情報取得
  const product = getProductById(productId)
  if (!product) {
    throw new Error(`商品ID "${productId}" が見つかりません`)
  }

  const supabase = await getSupabaseServerClient()

  // 会社情報取得
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.company_id)
    .single()

  if (companyError || !company) {
    throw new Error("会社情報が見つかりません")
  }

  // Stripe Customer作成または取得
  let customerId = company.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: company.name,
      metadata: {
        company_id: company.id,
        user_id: user.id,
      },
    })
    customerId = customer.id

    // Customer IDを保存
    await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company.id)
  }

  // Checkout Session作成
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price: product.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      company_id: company.id,
      user_id: user.id,
      product_id: productId,
    },
  })

  return session.client_secret
}

export async function createCustomerPortalSession() {
  // 認証チェック
  const { user } = await requireAuth()

  const supabase = await getSupabaseServerClient()

  // 会社情報取得
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.company_id)
    .single()

  if (companyError || !company || !company.stripe_customer_id) {
    throw new Error("Stripe顧客情報が見つかりません")
  }

  // Customer Portal Session作成
  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account`,
  })

  return session.url
}

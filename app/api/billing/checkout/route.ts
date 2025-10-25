import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createCheckoutSession } from "@/lib/stripe/client"
import { z } from "zod"

const checkoutSchema = z.object({
  priceId: z.string().min(1, "価格IDが必要です"),
})

// POST /api/billing/checkout - Checkout Session作成
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const body = await request.json()

    // バリデーション
    const validatedData = checkoutSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // 会社情報取得
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", user.company_id)
      .single()

    if (companyError || !company) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "会社情報が見つかりません")
    }

    // Stripe Customer ID確認
    let customerId = company.stripe_customer_id

    if (!customerId) {
      // TODO: Stripe Customerを作成
      customerId = `cus_mock_${Date.now()}`

      // Customer IDを保存
      await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company.id)
    }

    // Checkout Session作成
    const session = await createCheckoutSession({
      customerId,
      priceId: validatedData.priceId,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/account?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?payment=cancelled`,
      metadata: {
        company_id: company.id,
        user_id: user.id,
      },
    })

    return successResponse({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

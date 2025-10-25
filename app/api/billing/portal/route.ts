import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createCustomerPortalSession } from "@/lib/stripe/client"

// POST /api/billing/portal - Customer Portal URL取得
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
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

    if (!company.stripe_customer_id) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "Stripe顧客IDが設定されていません")
    }

    // Customer Portal Session作成
    const session = await createCustomerPortalSession({
      customerId: company.stripe_customer_id,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    })

    return successResponse({
      portalUrl: session.url,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/billing/subscription - サブスクリプション情報取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await getSupabaseServerClient()

    // サブスクリプション情報取得
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("company_id", user.company_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("[v0] Subscription fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "サブスクリプション情報の取得に失敗しました")
    }

    return successResponse(subscription)
  } catch (error) {
    return handleAPIError(error)
  }
}

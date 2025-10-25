import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/billing/usage - 使用量取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await getSupabaseServerClient()

    // RPC関数を呼び出し
    const { data: usage, error } = await supabase.rpc("get_current_usage", {
      p_company_id: user.company_id,
    })

    if (error) {
      console.error("[v0] Usage fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "使用量の取得に失敗しました")
    }

    return successResponse(usage)
  } catch (error) {
    return handleAPIError(error)
  }
}

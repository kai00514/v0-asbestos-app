import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/detections/stats - 統計情報取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // "day", "week", "month"

    const supabase = await getSupabaseServerClient()

    // RPC関数を呼び出し
    const { data: stats, error } = await supabase.rpc("get_dashboard_stats", {
      p_company_id: user.company_id,
      p_period: period,
    })

    if (error) {
      console.error("[v0] Stats fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "統計情報の取得に失敗しました")
    }

    return successResponse(stats)
  } catch (error) {
    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/notifications - 通知一覧取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)

    const supabase = await getSupabaseServerClient()

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error("[v0] Notifications fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "通知一覧の取得に失敗しました")
    }

    return successResponse(notifications || [])
  } catch (error) {
    return handleAPIError(error)
  }
}

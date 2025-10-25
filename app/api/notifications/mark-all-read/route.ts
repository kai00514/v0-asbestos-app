import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// POST /api/notifications/mark-all-read - 全て既読
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await getSupabaseServerClient()

    // 全ての未読通知を既読にする
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) {
      console.error("[v0] Mark all read error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "通知の既読処理に失敗しました")
    }

    return successResponse({}, "全ての通知を既読にしました")
  } catch (error) {
    return handleAPIError(error)
  }
}

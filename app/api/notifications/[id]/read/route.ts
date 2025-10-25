import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// PATCH /api/notifications/[id]/read - 既読にする
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    // 通知を既読にする
    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error || !notification) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "通知が見つかりません")
    }

    return successResponse(notification, "通知を既読にしました")
  } catch (error) {
    return handleAPIError(error)
  }
}

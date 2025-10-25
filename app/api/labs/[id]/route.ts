import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/labs/[id] - 分析機関詳細
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { data: lab, error } = await supabase.from("labs").select("*").eq("id", id).eq("is_active", true).single()

    if (error || !lab) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "分析機関が見つかりません")
    }

    return successResponse(lab)
  } catch (error) {
    return handleAPIError(error)
  }
}

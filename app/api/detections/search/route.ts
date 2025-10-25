import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/detections/search - 全文検索
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)

    if (!query || query.trim().length === 0) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "検索キーワードを入力してください")
    }

    const supabase = await getSupabaseServerClient()

    // 全文検索（sample_name, site_name, address, notesを対象）
    const { data: detections, error } = await supabase
      .from("detections")
      .select("id, detection_number, sample_name, site_name, detection_date, result, confidence")
      .eq("company_id", user.company_id)
      .eq("is_deleted", false)
      .or(`sample_name.ilike.%${query}%,site_name.ilike.%${query}%,address.ilike.%${query}%,notes.ilike.%${query}%`)
      .order("detection_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Search error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "検索に失敗しました")
    }

    return successResponse(detections || [])
  } catch (error) {
    return handleAPIError(error)
  }
}

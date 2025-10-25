import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/labs/nearby - 近隣の分析機関取得
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const latitude = Number.parseFloat(searchParams.get("latitude") || "0")
    const longitude = Number.parseFloat(searchParams.get("longitude") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "50") // km
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)

    if (!latitude || !longitude) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "緯度と経度が必要です")
    }

    const supabase = await getSupabaseServerClient()

    // RPC関数を呼び出し
    const { data: labs, error } = await supabase.rpc("get_nearby_labs", {
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_km: radius,
      p_limit: limit,
    })

    if (error) {
      console.error("[v0] Nearby labs fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "近隣の分析機関の取得に失敗しました")
    }

    return successResponse(labs || [])
  } catch (error) {
    return handleAPIError(error)
  }
}

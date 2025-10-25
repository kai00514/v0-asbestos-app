import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { paginatedResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/labs - 分析機関一覧取得
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "30"), 100)
    const search = searchParams.get("search")
    const prefecture = searchParams.get("prefecture")

    const supabase = await getSupabaseServerClient()

    let query = supabase.from("labs").select("*", { count: "exact" }).eq("is_active", true)

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    if (prefecture) {
      query = query.eq("prefecture", prefecture)
    }

    query = query.order("name")

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: labs, error, count } = await query

    if (error) {
      console.error("[v0] Labs fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "分析機関一覧の取得に失敗しました")
    }

    return paginatedResponse(labs || [], {
      page,
      limit,
      total: count || 0,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { paginatedResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/billing/invoices - 請求書一覧取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)

    const supabase = await getSupabaseServerClient()

    // 請求書一覧取得
    const from = (page - 1) * limit
    const to = from + limit - 1

    const {
      data: invoices,
      error,
      count,
    } = await supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("company_id", user.company_id)
      .order("invoice_date", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("[v0] Invoices fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "請求書一覧の取得に失敗しました")
    }

    return paginatedResponse(invoices || [], {
      page,
      limit,
      total: count || 0,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { createSiteTagSchema } from "@/lib/validations/site-tags"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/site-tags - タグ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await getSupabaseServerClient()

    const { data: siteTags, error } = await supabase
      .from("site_tags")
      .select("*")
      .eq("company_id", user.company_id)
      .order("name")

    if (error) {
      console.error("[v0] Site tags fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "現場タグ一覧の取得に失敗しました")
    }

    return successResponse(siteTags || [])
  } catch (error) {
    return handleAPIError(error)
  }
}

// POST /api/site-tags - タグ作成
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const body = await request.json()

    // バリデーション
    const validatedData = createSiteTagSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // 名前重複チェック
    const { data: existing } = await supabase
      .from("site_tags")
      .select("id")
      .eq("company_id", user.company_id)
      .eq("name", validatedData.name)
      .single()

    if (existing) {
      throw new APIError(409, ErrorCodes.VALIDATION_ERROR, "同じ名前のタグが既に存在します")
    }

    // タグ作成
    const { data: siteTag, error } = await supabase
      .from("site_tags")
      .insert({
        company_id: user.company_id,
        name: validatedData.name,
        color: validatedData.color,
        description: validatedData.description,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Site tag creation error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "現場タグの作成に失敗しました")
    }

    return successResponse(siteTag, "現場タグを作成しました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

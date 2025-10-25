import type { NextRequest } from "next/server"
import { requireRole } from "@/lib/api/auth"
import { updateSiteTagSchema } from "@/lib/validations/site-tags"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// PATCH /api/site-tags/[id] - タグ更新
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Owner権限が必要
    const { user } = await requireRole(["owner"])
    const { id } = await params
    const body = await request.json()

    // バリデーション
    const validatedData = updateSiteTagSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // タグ存在確認
    const { data: siteTag, error: fetchError } = await supabase
      .from("site_tags")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single()

    if (fetchError || !siteTag) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "現場タグが見つかりません")
    }

    // タグ更新
    const { data: updatedTag, error: updateError } = await supabase
      .from("site_tags")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Site tag update error:", updateError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "現場タグの更新に失敗しました")
    }

    return successResponse(updatedTag, "現場タグを更新しました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

// DELETE /api/site-tags/[id] - タグ削除
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Owner権限が必要
    const { user } = await requireRole(["owner"])
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    // タグ存在確認
    const { data: siteTag, error: fetchError } = await supabase
      .from("site_tags")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single()

    if (fetchError || !siteTag) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "現場タグが見つかりません")
    }

    // タグ削除
    const { error: deleteError } = await supabase.from("site_tags").delete().eq("id", id)

    if (deleteError) {
      console.error("[v0] Site tag delete error:", deleteError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "現場タグの削除に失敗しました")
    }

    return successResponse({}, "現場タグを削除しました")
  } catch (error) {
    return handleAPIError(error)
  }
}

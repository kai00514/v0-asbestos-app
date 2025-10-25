import type { NextRequest } from "next/server"
import { requireAuth, requireRole } from "@/lib/api/auth"
import { updateUserSchema } from "@/lib/validations/users"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/users/[id] - ユーザー詳細取得
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    // 同じ会社のユーザーのみ取得可能
    const { data: targetUser, error } = await supabase
      .from("users")
      .select(
        `
        *,
        user_site_tags(
          site_tags(*)
        )
      `,
      )
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single()

    if (error || !targetUser) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "ユーザーが見つかりません")
    }

    return successResponse(targetUser)
  } catch (error) {
    return handleAPIError(error)
  }
}

// PATCH /api/users/[id] - ユーザー更新
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // バリデーション
    const validatedData = updateUserSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // 対象ユーザー取得
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single()

    if (fetchError || !targetUser) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "ユーザーが見つかりません")
    }

    // 権限チェック
    // Ownerのロール変更はOwnerのみ可能
    if (validatedData.role && targetUser.role === "owner" && user.role !== "owner") {
      throw new APIError(403, ErrorCodes.FORBIDDEN, "Ownerのロールを変更する権限がありません")
    }

    // Member権限では他のユーザーを更新できない
    if (user.role === "member" && user.id !== id) {
      throw new APIError(403, ErrorCodes.FORBIDDEN, "他のユーザーを更新する権限がありません")
    }

    // ユーザー情報更新
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        name: validatedData.name,
        role: validatedData.role,
        department: validatedData.department,
        is_active: validatedData.is_active,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] User update error:", updateError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "ユーザー情報の更新に失敗しました")
    }

    // サイトタグ関連更新
    if (validatedData.siteTagIds) {
      // 既存の関連を削除
      await supabase.from("user_site_tags").delete().eq("user_id", id)

      // 新しい関連を追加
      if (validatedData.siteTagIds.length > 0) {
        const userSiteTags = validatedData.siteTagIds.map((tagId) => ({
          user_id: id,
          site_tag_id: tagId,
        }))

        await supabase.from("user_site_tags").insert(userSiteTags)
      }
    }

    return successResponse(updatedUser, "ユーザー情報を更新しました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

// DELETE /api/users/[id] - ユーザー削除
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Owner権限が必要
    const { user } = await requireRole(["owner"])
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    // 自分自身は削除できない
    if (user.id === id) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "自分自身を削除することはできません")
    }

    // 対象ユーザー取得
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single()

    if (fetchError || !targetUser) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "ユーザーが見つかりません")
    }

    // Soft Delete
    const { error: deleteError } = await supabase.from("users").update({ is_active: false }).eq("id", id)

    if (deleteError) {
      console.error("[v0] User delete error:", deleteError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "ユーザーの削除に失敗しました")
    }

    // Supabase Authからも削除（オプション）
    // await supabase.auth.admin.deleteUser(id)

    return successResponse({}, "ユーザーを削除しました")
  } catch (error) {
    return handleAPIError(error)
  }
}

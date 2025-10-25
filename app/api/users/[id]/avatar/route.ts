import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// POST /api/users/[id]/avatar - アバター画像アップロード
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params

    // 自分のアバターのみアップロード可能
    if (user.id !== id && user.role !== "owner") {
      throw new APIError(403, ErrorCodes.FORBIDDEN, "他のユーザーのアバターを変更する権限がありません")
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "ファイルが指定されていません")
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      throw new APIError(413, ErrorCodes.FILE_TOO_LARGE, "ファイルサイズは5MB以下である必要があります")
    }

    // ファイル形式チェック
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new APIError(400, ErrorCodes.INVALID_FILE_TYPE, "JPEG、PNG、WebP形式のみサポートしています")
    }

    const supabase = await getSupabaseServerClient()

    // ファイル名生成
    const fileExt = file.name.split(".").pop()
    const fileName = `${id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

    if (uploadError) {
      console.error("[v0] Avatar upload error:", uploadError)
      throw new APIError(500, ErrorCodes.INTERNAL_ERROR, "アバター画像のアップロードに失敗しました")
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    // ユーザーテーブルのavatar_url更新
    const { error: updateError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", id)

    if (updateError) {
      console.error("[v0] User avatar update error:", updateError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "アバターURLの更新に失敗しました")
    }

    return successResponse({ avatar_url: publicUrl }, "アバター画像をアップロードしました")
  } catch (error) {
    return handleAPIError(error)
  }
}

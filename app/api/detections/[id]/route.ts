import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { updateDetectionSchema } from "@/lib/validations/detections"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/detections/[id] - 判定詳細取得
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { data: detection, error } = await supabase
      .from("detections")
      .select(
        `
        *,
        detection_images(*, bounding_boxes(*)),
        site_tags(*),
        users(id, name, email, avatar_url)
      `,
      )
      .eq("id", id)
      .eq("company_id", user.company_id)
      .eq("is_deleted", false)
      .single()

    if (error || !detection) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "判定が見つかりません")
    }

    return successResponse(detection)
  } catch (error) {
    return handleAPIError(error)
  }
}

// PATCH /api/detections/[id] - 判定更新
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // バリデーション
    const validatedData = updateDetectionSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // 対象判定取得
    const { data: detection, error: fetchError } = await supabase
      .from("detections")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .eq("is_deleted", false)
      .single()

    if (fetchError || !detection) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "判定が見つかりません")
    }

    // 権限チェック（作成者またはOwner）
    if (detection.created_by !== user.id && user.role !== "owner") {
      throw new APIError(403, ErrorCodes.FORBIDDEN, "この判定を更新する権限がありません")
    }

    // 判定更新
    const updateData: any = {}
    if (validatedData.sample_name) updateData.sample_name = validatedData.sample_name
    if (validatedData.site_name) updateData.site_name = validatedData.site_name
    if (validatedData.site_tag_id !== undefined) updateData.site_tag_id = validatedData.site_tag_id
    if (validatedData.address !== undefined) updateData.address = validatedData.address
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.location !== undefined) {
      updateData.location = validatedData.location
        ? `POINT(${validatedData.location.longitude} ${validatedData.location.latitude})`
        : null
    }

    const { data: updatedDetection, error: updateError } = await supabase
      .from("detections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Detection update error:", updateError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "判定の更新に失敗しました")
    }

    return successResponse(updatedDetection, "判定を更新しました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

// DELETE /api/detections/[id] - 判定削除（Soft Delete）
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params

    // Owner権限が必要
    if (user.role !== "owner") {
      throw new APIError(403, ErrorCodes.FORBIDDEN, "判定を削除する権限がありません")
    }

    const supabase = await getSupabaseServerClient()

    // 対象判定取得
    const { data: detection, error: fetchError } = await supabase
      .from("detections")
      .select("*")
      .eq("id", id)
      .eq("company_id", user.company_id)
      .single()

    if (fetchError || !detection) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "判定が見つかりません")
    }

    // Soft Delete
    const { error: deleteError } = await supabase.from("detections").update({ is_deleted: true }).eq("id", id)

    if (deleteError) {
      console.error("[v0] Detection delete error:", deleteError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "判定の削除に失敗しました")
    }

    return successResponse({}, "判定を削除しました")
  } catch (error) {
    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { updateMeSchema } from "@/lib/validations/users"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/users/me - 自分の情報取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()

    return successResponse(user)
  } catch (error) {
    return handleAPIError(error)
  }
}

// PATCH /api/users/me - 自分の情報更新
export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const body = await request.json()

    // バリデーション
    const validatedData = updateMeSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // ユーザー情報更新
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(validatedData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] User update error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "ユーザー情報の更新に失敗しました")
    }

    return successResponse(updatedUser, "ユーザー情報を更新しました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

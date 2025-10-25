import type { NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { passwordResetConfirmSchema } from "@/lib/validations/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedData = passwordResetConfirmSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // パスワード更新
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    })

    if (error) {
      console.error("[v0] Password update error:", error)
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "パスワードの更新に失敗しました")
    }

    return successResponse({}, "パスワードが更新されました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

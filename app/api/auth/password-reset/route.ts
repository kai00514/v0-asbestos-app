import type { NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { passwordResetSchema } from "@/lib/validations/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedData = passwordResetSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // パスワードリセットメール送信
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("[v0] Password reset error:", error)
      // セキュリティのため、メールアドレスが存在しない場合でも成功レスポンスを返す
    }

    return successResponse({}, "パスワードリセットメールを送信しました。メールを確認してください。")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

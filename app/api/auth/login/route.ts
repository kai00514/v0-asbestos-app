import type { NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/validations/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedData = loginSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Supabase Auth でログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, "メールアドレスまたはパスワードが正しくありません")
    }

    if (!authData.user) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, "ログインに失敗しました")
    }

    // ユーザー情報取得（会社、設定含む）
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*, companies(*), user_settings(*)")
      .eq("id", authData.user.id)
      .single()

    if (userError || !user) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, "ユーザー情報が見つかりません")
    }

    // アクティブステータス確認
    if (!user.is_active) {
      throw new APIError(403, ErrorCodes.FORBIDDEN, "アカウントが無効化されています。管理者に連絡してください。")
    }

    // オンボーディング状態確認
    const redirectTo = user.onboarding_completed ? "/dashboard" : "/onboarding"

    return successResponse(
      {
        user,
        redirectTo,
      },
      "ログインしました",
    )
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

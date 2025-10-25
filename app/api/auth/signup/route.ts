import type { NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { signupSchema } from "@/lib/validations/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedData = signupSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // Supabase Auth でユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          name: validatedData.name,
        },
      },
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        throw new APIError(409, ErrorCodes.EMAIL_ALREADY_EXISTS, "このメールアドレスは既に登録されています")
      }
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, authError.message)
    }

    if (!authData.user) {
      throw new APIError(500, ErrorCodes.INTERNAL_ERROR, "ユーザー作成に失敗しました")
    }

    // 会社レコード作成
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: validatedData.companyName,
        owner_id: authData.user.id,
      })
      .select()
      .single()

    if (companyError) {
      console.error("[v0] Company creation error:", companyError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "会社情報の作成に失敗しました")
    }

    // ユーザーテーブルに登録（Owner権限）
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        name: validatedData.name,
        company_id: company.id,
        role: "owner",
        is_active: true,
      })
      .select()
      .single()

    if (userError) {
      console.error("[v0] User creation error:", userError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "ユーザー情報の作成に失敗しました")
    }

    // ユーザー設定初期化
    await supabase.from("user_settings").insert({
      user_id: authData.user.id,
      notification_detection_complete: true,
      notification_limit_warning: true,
      notification_payment_reminder: true,
      notification_team_activity: false,
    })

    // トライアルサブスクリプション作成
    await supabase.from("subscriptions").insert({
      company_id: company.id,
      status: "trialing",
      monthly_limit: 50,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
    })

    return successResponse(
      {
        user,
        company,
        redirectTo: "/onboarding",
      },
      "アカウントが作成されました。メールを確認してください。",
    )
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

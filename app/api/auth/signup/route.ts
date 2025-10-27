import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { signupSchema } from "@/lib/validations/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  let authUserId: string | null = null
  let companyId: string | null = null

  try {
    const body = await request.json()

    // バリデーション
    const validatedData = signupSchema.parse(body)

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingAuthUsers?.users?.some((u) => u.email === validatedData.email)

    if (userExists) {
      throw new APIError(409, ErrorCodes.EMAIL_ALREADY_EXISTS, "このメールアドレスは既に登録されています")
    }

    // Supabase Auth でユーザー作成
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
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

    authUserId = authData.user.id

    const { data: existingCompany } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("name", validatedData.companyName)
      .maybeSingle()

    let company
    if (existingCompany) {
      // 既存の会社を使用
      company = existingCompany
    } else {
      // 新規作成
      const { data: newCompany, error: companyError } = await supabaseAdmin
        .from("companies")
        .insert({
          name: validatedData.companyName,
        })
        .select()
        .single()

      if (companyError) {
        console.error("[v0] Company creation error:", companyError)
        throw new APIError(500, ErrorCodes.DATABASE_ERROR, "会社情報の作成に失敗しました")
      }
      company = newCompany
    }

    companyId = company.id

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: authData.user.id,
          email: validatedData.email,
          name: validatedData.name,
          company_id: company.id,
          role: "owner",
          is_active: true,
        },
        {
          onConflict: "id",
        },
      )
      .select()
      .single()

    if (userError) {
      console.error("[v0] User creation error:", userError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "ユーザー情報の作成に失敗しました")
    }

    const { error: settingsError } = await supabaseAdmin.from("user_settings").upsert(
      {
        user_id: authData.user.id,
        detection_completed_notifications: true,
        limit_notifications: true,
        payment_notifications: true,
        news_notifications: false,
      },
      {
        onConflict: "user_id",
      },
    )

    if (settingsError) {
      console.error("[v0] User settings creation error:", settingsError)
      // 設定作成失敗は致命的ではないのでログのみ
    }

    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const { error: subscriptionError } = await supabaseAdmin.from("subscriptions").upsert(
      {
        company_id: company.id,
        plan_name: "trial",
        status: "trialing",
        monthly_limit: 50,
        trial_end: trialEndDate.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString(),
      },
      {
        onConflict: "company_id",
      },
    )

    if (subscriptionError) {
      console.error("[v0] Subscription creation error:", subscriptionError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "サブスクリプションの作成に失敗しました")
    }

    return successResponse(
      {
        user,
        company,
        message:
          "アカウントが作成されました。確認メールを送信しましたので、メール内のリンクをクリックして登録を完了してください。",
      },
      "アカウントが作成されました",
    )
  } catch (error) {
    if (authUserId || companyId) {
      console.log("[v0] Cleaning up due to error...")
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )

      // Supabase Authのユーザーを削除
      if (authUserId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUserId)
          console.log("[v0] Deleted auth user:", authUserId)
        } catch (deleteError) {
          console.error("[v0] Failed to delete auth user:", deleteError)
        }
      }

      // 作成した会社を削除（カスケード削除でusers, subscriptionsも削除される）
      if (companyId) {
        try {
          await supabaseAdmin.from("companies").delete().eq("id", companyId)
          console.log("[v0] Deleted company:", companyId)
        } catch (deleteError) {
          console.error("[v0] Failed to delete company:", deleteError)
        }
      }
    }

    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

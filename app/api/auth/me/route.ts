import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // トークンからユーザーIDを取得
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 })
    }

    console.log("[v0] Fetching user data for:", user.id)

    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("is_active, email_confirmed")
      .eq("id", user.id)
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "ユーザー情報の取得に失敗しました" }, { status: 500 })
    }

    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("user_settings")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()

    if (settingsError) {
      console.error("[v0] Settings error:", settingsError)
      return NextResponse.json({ error: "設定情報の取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      is_active: userData.is_active,
      email_confirmed: userData.email_confirmed,
      onboarding_completed: settingsData.onboarding_completed,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

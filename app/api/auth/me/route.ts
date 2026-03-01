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

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 })
    }

    console.log("[v0] Fetching user data for:", user.id)
    console.log("[v0] Auth email_confirmed_at:", user.email_confirmed_at)

    if (user.email_confirmed_at) {
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ email_confirmed: true })
        .eq("id", user.id)
        .eq("email_confirmed", false) // まだ更新されていない場合のみ

      if (updateError) {
        console.error("[v0] Error syncing email_confirmed:", updateError)
      } else {
        console.log("[v0] Synced email_confirmed to true for user:", user.id)
      }
    }

    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("is_active, email_confirmed")
      .eq("id", user.id)
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "ユーザー情報の取得に失敗しました" }, { status: 500 })
    }

    let { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("user_settings")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle()

    if (settingsError) {
      console.error("[v0] Settings error:", settingsError)
      return NextResponse.json({ error: "設定情報の取得に失敗しました" }, { status: 500 })
    }

    // user_settingsが存在しない場合は自動作成
    if (!settingsData) {
      console.log("[v0] Creating missing user_settings for:", user.id)
      const { data: newSettings, error: insertError } = await supabaseAdmin
        .from("user_settings")
        .insert({ user_id: user.id, onboarding_completed: false })
        .select("onboarding_completed")
        .single()

      if (insertError) {
        console.error("[v0] Failed to create user_settings:", insertError)
        return NextResponse.json({ error: "設定情報の作成に失敗しました" }, { status: 500 })
      }
      settingsData = newSettings
    }

    const emailConfirmed = !!user.email_confirmed_at

    return NextResponse.json({
      is_active: userData.is_active,
      email_confirmed: emailConfirmed,
      onboarding_completed: settingsData.onboarding_completed,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

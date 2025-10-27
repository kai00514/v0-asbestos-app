import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    // 認証済みユーザーを取得
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    console.log("[v0] Completing onboarding for user:", user.id)

    // サービスロールクライアントでRLSをバイパス
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })

    // user_settingsのonboarding_completedをTRUEに更新
    const { error: updateError } = await supabaseAdmin
      .from("user_settings")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("[v0] Error updating onboarding status:", updateError)
      return NextResponse.json({ error: "オンボーディングの完了に失敗しました" }, { status: 500 })
    }

    console.log("[v0] Onboarding completed successfully for user:", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Complete onboarding error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

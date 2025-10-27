import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const token = requestUrl.searchParams.get("token")
  const type = requestUrl.searchParams.get("type")
  const origin = requestUrl.origin

  console.log("[v0] Callback params:", { code, token, type })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
        },
      },
    },
  )

  if (code) {
    // PKCEフロー（推奨）
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("[v0] Error exchanging code:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }
  } else if (token && type) {
    // レガシーフロー（token/type）
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })
    if (error) {
      console.error("[v0] Error verifying OTP:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }
  } else {
    console.error("[v0] No code or token provided")
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    console.log("[v0] User authenticated:", user.id)

    // サービスロールクライアントでRLSをバイパス
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })

    const { error: updateError } = await supabaseAdmin.from("users").update({ email_confirmed: true }).eq("id", user.id)

    if (updateError) {
      console.error("[v0] Error updating email_confirmed:", updateError)
    } else {
      console.log("[v0] Email confirmed for user:", user.id)
    }

    const { data: settingsData } = await supabaseAdmin
      .from("user_settings")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("[v0] Settings data:", settingsData)

    if (settingsData?.onboarding_completed) {
      return NextResponse.redirect(`${origin}/dashboard`)
    } else {
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  } else {
    console.error("[v0] No user found after authentication")
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }
}

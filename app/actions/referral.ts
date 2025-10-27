"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database.types"

export async function generateReferralUrl() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.log("[v0] generateReferralUrl auth error:", error)
    throw new Error("認証が必要です")
  }

  console.log("[v0] Generating referral URL for user:", user.id)

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: existingReferral } = await supabaseAdmin
    .from("referrals")
    .select("referral_code")
    .eq("referrer_id", user.id)
    .eq("status", "pending")
    .maybeSingle()

  let referralCode: string

  if (existingReferral) {
    referralCode = existingReferral.referral_code
    console.log("[v0] Using existing referral code:", referralCode)
  } else {
    // ランダムな8文字の英数字を生成
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase()
    referralCode = `REF${randomStr}`

    console.log("[v0] Generated referral code:", referralCode, "length:", referralCode.length)

    await supabaseAdmin.from("referrals").insert({
      referrer_id: user.id,
      referral_code: referralCode,
      referrer_bonus_type: "判定回数 +20回",
      referred_bonus_type: "14日間トライアル + 判定回数 +20回",
      status: "pending",
    })

    console.log("[v0] Created new referral code:", referralCode)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const referralUrl = `${baseUrl}/signup?ref=${referralCode}`
  console.log("[v0] Generated referral URL:", referralUrl)

  return referralUrl
}

export async function getReferralStats(userId: string) {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: referrals } = await supabaseAdmin
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId)
    .in("status", ["pending", "completed"])

  const totalReferrals = referrals?.filter((r) => r.status === "completed").length || 0
  const totalBonus = totalReferrals * 20

  return {
    totalReferrals,
    totalBonus,
    referrals: referrals || [],
  }
}

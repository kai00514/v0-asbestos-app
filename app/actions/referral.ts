"use server"

import { createClient } from "@supabase/supabase-js"
import { requireAuth } from "@/lib/api/auth"
import type { Database } from "@/lib/types/database.types"

export async function generateReferralUrl() {
  const { user } = await requireAuth()

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  // 既存の紹介コードを確認
  const { data: existingReferral } = await supabaseAdmin
    .from("referrals")
    .select("referral_code")
    .eq("referrer_user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  let referralCode: string

  if (existingReferral) {
    referralCode = existingReferral.referral_code
  } else {
    // 新しい紹介コードを生成
    referralCode = `REF-${user.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`

    // 紹介レコード作成
    await supabaseAdmin.from("referrals").insert({
      referrer_user_id: user.id,
      referral_code: referralCode,
      bonus_detections: 20,
      trial_days: 14,
      status: "active",
    })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return `${baseUrl}/signup?ref=${referralCode}`
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
    .eq("referrer_user_id", userId)
    .eq("status", "active")

  const totalReferrals = referrals?.length || 0
  const totalBonus = (referrals?.reduce((sum, r) => sum + (r.bonus_detections || 0), 0) || 0) * totalReferrals

  return {
    totalReferrals,
    totalBonus,
    referrals: referrals || [],
  }
}

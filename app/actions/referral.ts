"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/api/auth"

export async function generateReferralUrl() {
  const { user } = await requireAuth()

  const supabase = await getSupabaseServerClient()

  // 既存の紹介コードを確認
  const { data: existingReferral } = await supabase
    .from("referrals")
    .select("referral_code")
    .eq("referrer_user_id", user.id)
    .eq("status", "active")
    .single()

  let referralCode: string

  if (existingReferral) {
    referralCode = existingReferral.referral_code
  } else {
    // 新しい紹介コードを生成
    referralCode = `REF-${user.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`

    // 紹介レコード作成
    await supabase.from("referrals").insert({
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
  const supabase = await getSupabaseServerClient()

  const { data: referrals } = await supabase
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

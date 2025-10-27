import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function isTrialUser(userId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  const { data: user } = await supabase.from("users").select("company_id").eq("id", userId).maybeSingle()

  if (!user) return false

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_end")
    .eq("company_id", user.company_id)
    .maybeSingle()

  if (!subscription) return false

  // トライアル中かチェック
  if (subscription.status === "trialing" && subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end)
    return trialEnd > new Date()
  }

  return false
}

export async function canUseAIDetection(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await getSupabaseServerClient()

  const { data: user } = await supabase.from("users").select("company_id").eq("id", userId).maybeSingle()

  if (!user) {
    return { allowed: false, reason: "ユーザーが見つかりません" }
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, monthly_limit, trial_end")
    .eq("company_id", user.company_id)
    .maybeSingle()

  if (!subscription) {
    return { allowed: false, reason: "サブスクリプションが見つかりません" }
  }

  // ステータスチェック
  if (subscription.status === "trialing") {
    // トライアル期間中
    const trialEnd = new Date(subscription.trial_end!)
    if (trialEnd < new Date()) {
      return { allowed: false, reason: "トライアル期間が終了しました" }
    }
  } else if (subscription.status !== "active") {
    return { allowed: false, reason: "サブスクリプションが有効ではありません" }
  }

  // 月次上限チェック
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const { count } = await supabase
    .from("detections")
    .select("*", { count: "exact", head: true })
    .eq("company_id", user.company_id)
    .eq("is_deleted", false)
    .gte("detection_date", monthStart.toISOString())

  if ((count || 0) >= subscription.monthly_limit) {
    return { allowed: false, reason: "今月の判定回数上限に達しました" }
  }

  return { allowed: true }
}

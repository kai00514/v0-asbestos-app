import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type Detection = Database["public"]["Tables"]["detections"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

export interface DashboardStats {
  totalDetections: number
  positiveCount: number
  negativeCount: number
  currentUsage: number
  monthlyLimit: number
  usagePercentage: number
  recentActivity: Array<{
    id: string
    sampleName: string
    result: boolean
    confidence: number
    detectionDate: string
    userName: string
  }>
}

export async function getDashboardStats(
  companyId: string,
  userId?: string,
  period: "today" | "week" | "month" = "month",
): Promise<DashboardStats> {
  const supabase = await getSupabaseServerClient()

  // 期間の計算
  const now = new Date()
  let startDate: Date

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  // 判定データの取得
  let query = supabase
    .from("detections")
    .select(
      `
      id,
      sample_name,
      result,
      confidence,
      detection_date,
      user:users!detections_user_id_fkey(name)
    `,
    )
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .gte("detection_date", startDate.toISOString())
    .order("detection_date", { ascending: false })

  // ユーザーフィルター
  if (userId && userId !== "all") {
    query = query.eq("user_id", userId)
  }

  const { data: detections, error } = await query

  if (error) {
    console.error("[v0] Error fetching detections:", error)
    throw error
  }

  // 統計計算
  const totalDetections = detections?.length || 0
  const positiveCount = detections?.filter((d) => d.result === true).length || 0
  const negativeCount = detections?.filter((d) => d.result === false).length || 0

  // 今月の利用状況取得
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("monthly_limit")
    .eq("company_id", companyId)
    .single()

  const monthlyLimit = subscription?.monthly_limit || 30

  // 今月の利用回数
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const { count: currentUsage } = await supabase
    .from("detections")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .gte("detection_date", monthStart.toISOString())

  const usagePercentage = Math.round(((currentUsage || 0) / monthlyLimit) * 100)

  // 最近の活動
  const recentActivity =
    detections?.slice(0, 10).map((d) => ({
      id: d.id,
      sampleName: d.sample_name,
      result: d.result,
      confidence: d.confidence,
      detectionDate: d.detection_date,
      userName: (d.user as any)?.name || "不明",
    })) || []

  return {
    totalDetections,
    positiveCount,
    negativeCount,
    currentUsage: currentUsage || 0,
    monthlyLimit,
    usagePercentage,
    recentActivity,
  }
}

export async function getTeamMembers(companyId: string): Promise<User[]> {
  const supabase = await getSupabaseServerClient()

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching team members:", error)
    throw error
  }

  return users || []
}

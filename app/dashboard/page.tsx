import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getDashboardStats, getTeamMembers } from "@/lib/api/dashboard"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AccountSelector } from "@/components/dashboard/account-selector"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { DonutChartCard } from "@/components/dashboard/donut-chart-card"
import { UsageStatusCard } from "@/components/dashboard/usage-status-card"
import { MapCard } from "@/components/dashboard/map-card"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { user?: string; period?: "today" | "week" | "month" }
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("company_id").eq("id", user.id).maybeSingle()

  if (!userData?.company_id) {
    redirect("/login")
  }

  const selectedUserId = searchParams.user || "all"
  const period = searchParams.period || "month"

  const [stats, teamMembers] = await Promise.all([
    getDashboardStats(userData.company_id, selectedUserId === "all" ? undefined : selectedUserId, period),
    getTeamMembers(userData.company_id),
  ])

  return (
    <div className="min-h-screen bg-gray-300 pb-20 md:pb-0">
      <DashboardHeader />

      <main className="px-4 -mt-8 space-y-4 max-w-md mx-auto relative z-10">
        <AccountSelector teamMembers={teamMembers} selectedUserId={selectedUserId} />
        <DashboardTabs period={period} />

        <div className="space-y-4">
          <DonutChartCard positiveCount={stats.positiveCount} negativeCount={stats.negativeCount} />
          <UsageStatusCard
            currentUsage={stats.currentUsage}
            monthlyLimit={stats.monthlyLimit}
            usagePercentage={stats.usagePercentage}
          />
          <MapCard />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

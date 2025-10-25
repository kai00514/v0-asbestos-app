import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { DonutChartCard } from "@/components/dashboard/donut-chart-card"
import { UsageStatusCard } from "@/components/dashboard/usage-status-card"
import { MapCard } from "@/components/dashboard/map-card"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-200 pb-20 md:pb-0">
      <DashboardHeader />

      <main className="px-4 -mt-8 space-y-4 max-w-md mx-auto relative z-10">
        <DashboardTabs />

        <div className="space-y-4">
          <DonutChartCard />
          <UsageStatusCard />
          <MapCard />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

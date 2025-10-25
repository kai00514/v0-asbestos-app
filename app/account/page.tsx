import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AccountInfo } from "@/components/account/account-info"
import { PlanBilling } from "@/components/account/plan-billing"
import { NotificationSettings } from "@/components/account/notification-settings"
import { TeamManagement } from "@/components/account/team-management"
import { GeneralSettings } from "@/components/account/general-settings"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const mockUser = user || {
    id: "demo-user-id",
    email: "demo@example.com",
    user_metadata: {
      company_name: "デモ株式会社",
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <h1 className="text-xl font-bold text-gray-900">アカウント設定</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <AccountInfo user={mockUser} />
        <PlanBilling />
        <NotificationSettings />
        <TeamManagement />
        <GeneralSettings />

        <div className="pt-6">
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent">
            ログアウト
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getAccountData } from "@/lib/api/account"
import { AccountInfo } from "@/components/account/account-info"
import { PlanBilling } from "@/components/account/plan-billing"
import { NotificationSettings } from "@/components/account/notification-settings"
import { TeamManagement } from "@/components/account/team-management"
import { GeneralSettings } from "@/components/account/general-settings"
import { ReferralProgram } from "@/components/account/referral-program"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  const demoUserId = "10000000-0000-0000-0000-000000000001"

  const accountData = await getAccountData(demoUserId)

  return (
    <div className="min-h-screen bg-gray-300 pb-24 md:pb-6">
      <WaveHeader title="アカウント設定" showLogo={false} />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <AccountInfo user={accountData.user} company={accountData.company} />
        <PlanBilling subscription={accountData.subscription} />
        <ReferralProgram />
        <NotificationSettings settings={accountData.settings} />
        {accountData.user.role === "owner" && <TeamManagement teamMembers={accountData.teamMembers} />}
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

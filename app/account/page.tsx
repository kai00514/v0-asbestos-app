import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getAccountData } from "@/lib/api/account"
import { redirect } from "next/navigation"
import { AccountInfo } from "@/components/account/account-info"
import { PlanBilling } from "@/components/account/plan-billing"
import { NotificationSettings } from "@/components/account/notification-settings"
import { TeamManagement } from "@/components/account/team-management"
import { GeneralSettings } from "@/components/account/general-settings"
import { ReferralProgram } from "@/components/account/referral-program"
import { LogoutButton } from "@/components/account/logout-button"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const accountData = await getAccountData(user.id)

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
          <LogoutButton />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

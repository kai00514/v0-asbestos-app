import { getSupabaseServerClient } from "@/lib/supabase/server"
import { PricingCards } from "@/components/pricing/pricing-cards"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function PricingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 md:pb-6">
      <WaveHeader title="料金プラン" showLogo={false} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6 text-sm text-yellow-700 text-center">
          決済機能はまだ実装されていません。現在すべてのプランは表示のみとなっています。
        </div>
        <PricingCards />
        <PricingFAQ />
      </main>

      <BottomNav />
    </div>
  )
}

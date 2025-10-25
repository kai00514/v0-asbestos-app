import { getSupabaseServerClient } from "@/lib/supabase/server"
import { PricingCards } from "@/components/pricing/pricing-cards"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function PricingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <h1 className="text-xl font-bold text-gray-900">料金プラン</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <PricingCards />
        <PricingFAQ />
      </main>

      <BottomNav />
    </div>
  )
}

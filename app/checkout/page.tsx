import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import StripeCheckout from "@/components/stripe/checkout"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function CheckoutPage({ searchParams }: { searchParams: { plan?: string } }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  const planId = searchParams.plan || "basic"

  return (
    <div className="min-h-screen bg-gray-300">
      <WaveHeader title="お支払い" showLogo={false} showBack />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
          <StripeCheckout productId={planId} />
        </Suspense>
      </main>
    </div>
  )
}

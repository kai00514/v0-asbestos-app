import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AIDetectionForm } from "@/components/ai/ai-detection-form"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function AIDetectionPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 md:pb-6">
      <WaveHeader title="AI判定" showLogo={false} />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <AIDetectionForm />
      </main>

      <BottomNav />
    </div>
  )
}

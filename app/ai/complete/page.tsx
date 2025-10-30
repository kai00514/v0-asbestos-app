import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CompletionResult } from "@/components/ai/completion-result"
import { CompletionActions } from "@/components/ai/completion-actions"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"
import { redirect } from "next/navigation"

export default async function AICompletePage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const detectionId = searchParams.id

  if (!detectionId) {
    redirect("/ai")
  }

  return (
    <div className="min-h-screen bg-gray-300 pb-20 md:pb-0">
      <WaveHeader title="AI判定完了" showLogo={false} />

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <CompletionResult detectionId={detectionId} />
        <CompletionActions detectionId={detectionId} />
      </main>

      <BottomNav />
    </div>
  )
}

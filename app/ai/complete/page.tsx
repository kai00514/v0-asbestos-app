import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CompletionResult } from "@/components/ai/completion-result"
import { CompletionActions } from "@/components/ai/completion-actions"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function AICompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  const params = await searchParams
  const detectionId = params.id

  if (!detectionId) {
    return (
      <div className="min-h-screen bg-gray-300 pb-20 md:pb-0">
        <WaveHeader title="AI判定完了" showLogo={false} />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-red-600 font-medium">判定IDが指定されていません</p>
            <p className="text-gray-600 mt-2">正しいURLからアクセスしてください</p>
          </div>
        </main>
        <BottomNav />
      </div>
    )
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

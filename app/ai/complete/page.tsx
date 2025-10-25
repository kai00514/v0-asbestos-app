import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CompletionResult } from "@/components/ai/completion-result"
import { CompletionActions } from "@/components/ai/completion-actions"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function AICompletePage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  const detectionId = searchParams.id || "0004"

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 pb-20 md:pb-0">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <h1 className="text-xl font-bold text-gray-900">AI判定完了</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <CompletionResult detectionId={detectionId} />
        <CompletionActions detectionId={detectionId} />
      </main>

      <BottomNav />
    </div>
  )
}

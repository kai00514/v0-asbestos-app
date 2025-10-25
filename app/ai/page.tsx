import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AIDetectionForm } from "@/components/ai/ai-detection-form"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function AIDetectionPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">AI判定</h1>
            <button className="text-emerald-600 hover:text-emerald-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <AIDetectionForm />
      </main>

      <BottomNav />
    </div>
  )
}

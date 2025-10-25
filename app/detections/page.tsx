import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DetectionList } from "@/components/detections/detection-list"
import { DetectionFilters } from "@/components/detections/detection-filters"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function DetectionsPage() {
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
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <h1 className="text-xl font-bold text-gray-900">判定一覧</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <DetectionFilters />
        <DetectionList />
      </main>

      <BottomNav />
    </div>
  )
}

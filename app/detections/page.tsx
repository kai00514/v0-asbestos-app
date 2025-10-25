import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DetectionList } from "@/components/detections/detection-list"
import { DetectionFilters } from "@/components/detections/detection-filters"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function DetectionsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-300 pb-20 md:pb-0">
      <WaveHeader title="判定一覧" showLogo={false} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <DetectionFilters />
        <DetectionList />
      </main>

      <BottomNav />
    </div>
  )
}

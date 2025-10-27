import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getDetections } from "@/lib/api/detections"
import { DetectionList } from "@/components/detections/detection-list"
import { DetectionFilters } from "@/components/detections/detection-filters"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function DetectionsPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    result?: string
    siteTagId?: string
    startDate?: string
    endDate?: string
  }
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  const demoCompanyId = "00000000-0000-0000-0000-000000000001"

  const detections = await getDetections(demoCompanyId, {
    search: searchParams.search,
    result: searchParams.result === "true" ? true : searchParams.result === "false" ? false : undefined,
    siteTagId: searchParams.siteTagId,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
  })

  return (
    <div className="min-h-screen bg-gray-300 pb-24 md:pb-6">
      <WaveHeader title="判定一覧" showLogo={false} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <DetectionFilters />
        <DetectionList detections={detections} />
      </main>

      <BottomNav />
    </div>
  )
}

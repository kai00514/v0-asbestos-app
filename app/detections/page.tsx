import { createClient } from "@supabase/supabase-js"
import { getDetections } from "@/lib/api/detections"
import { DetectionList } from "@/components/detections/detection-list"
import { DetectionFilters } from "@/components/detections/detection-filters"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function DetectionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    result?: string
    siteTagId?: string
    startDate?: string
    endDate?: string
  }>
}) {
  const resolvedParams = await searchParams

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let detections: Awaited<ReturnType<typeof getDetections>> = []

  if (user) {
    const { data: userData } = await supabase.from("users").select("company_id").eq("id", user.id).maybeSingle()

    if (userData?.company_id) {
      try {
        console.log("[v0] Fetching detections for company:", userData.company_id)
        detections = await getDetections(userData.company_id, {
          search: resolvedParams.search,
          result: resolvedParams.result === "true" ? true : resolvedParams.result === "false" ? false : undefined,
          siteTagId: resolvedParams.siteTagId,
          startDate: resolvedParams.startDate,
          endDate: resolvedParams.endDate,
        })
        console.log("[v0] Detections fetched:", detections.length)
      } catch (error) {
        console.error("[v0] Failed to fetch detections:", error)
      }
    }
  }

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

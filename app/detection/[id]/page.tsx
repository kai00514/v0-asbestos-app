import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ImageGallery } from "@/components/detection/image-gallery"
import { DetectionMetadata } from "@/components/detection/detection-metadata"
import { DetectionActions } from "@/components/detection/detection-actions"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"
import { redirect } from "next/navigation"

export default async function DetectionDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 判定データを取得
  const { data: detection } = await supabase
    .from("detections")
    .select(`
      *,
      detection_images(*, bounding_boxes(*)),
      site_tags(*),
      users(id, name, email, avatar_url)
    `)
    .eq("id", params.id)
    .single()

  if (!detection) {
    return <div>判定が見つかりません</div>
  }

  return (
    <div className="min-h-screen bg-gray-300 pb-32 md:pb-0">
      <WaveHeader title={`判定詳細 #${detection.detection_number}`} showLogo={false} showBackButton />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <ImageGallery images={detection.detection_images} />
        <DetectionMetadata id={params.id} />
        <DetectionActions id={params.id} />
      </main>

      <BottomNav />
    </div>
  )
}

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ImageGallery } from "@/components/detection/image-gallery"
import { DetectionMetadata } from "@/components/detection/detection-metadata"
import { DetectionActions } from "@/components/detection/detection-actions"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function DetectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-300 pb-24 md:pb-6">
      <WaveHeader title="判定詳細" showLogo={false} showBackButton />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <ImageGallery detectionId={id} />
        <DetectionMetadata id={id} />
        <DetectionActions id={id} />
      </main>

      <BottomNav />
    </div>
  )
}

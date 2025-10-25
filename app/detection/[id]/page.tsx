import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DetectionHeader } from "@/components/detection/detection-header"
import { ImageGallery } from "@/components/detection/image-gallery"
import { DetectionMetadata } from "@/components/detection/detection-metadata"
import { DetectionActions } from "@/components/detection/detection-actions"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function DetectionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-0">
      <DetectionHeader id={params.id} />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <ImageGallery />
        <DetectionMetadata id={params.id} />
        <DetectionActions id={params.id} />
      </main>

      <BottomNav />
    </div>
  )
}

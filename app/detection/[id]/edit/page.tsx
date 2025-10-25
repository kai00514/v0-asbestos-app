import { getSupabaseServerClient } from "@/lib/supabase/server"
import { EditDetectionForm } from "@/components/detection/edit-detection-form"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function EditDetectionPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-200 pb-20 md:pb-0">
      <WaveHeader title="判定を編集" showLogo={false} showBackButton />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <EditDetectionForm detectionId={params.id} />
      </main>

      <BottomNav />
    </div>
  )
}

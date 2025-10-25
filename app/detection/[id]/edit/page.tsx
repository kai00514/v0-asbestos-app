import { getSupabaseServerClient } from "@/lib/supabase/server"
import { EditDetectionForm } from "@/components/detection/edit-detection-form"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function EditDetectionPage({ params }: { params: { id: string } }) {
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
          <h1 className="text-xl font-bold text-gray-900">判定を編集</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <EditDetectionForm detectionId={params.id} />
      </main>

      <BottomNav />
    </div>
  )
}

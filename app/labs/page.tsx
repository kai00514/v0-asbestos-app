import { getSupabaseServerClient } from "@/lib/supabase/server"
import { LabList } from "@/components/labs/lab-list"
import { LabFilters } from "@/components/labs/lab-filters"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function LabsPage({
  searchParams,
}: {
  searchParams: { detectionId?: string }
}) {
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
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">分析機関一覧</h1>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded-lg bg-white">リスト</button>
              <button className="px-3 py-1 text-sm border rounded-lg text-gray-600">マップ</button>
            </div>
          </div>
        </div>
      </header>

      {searchParams.detectionId && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <p className="text-sm text-blue-800">判定ID [{searchParams.detectionId}] の情報を引き継いでいます</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <LabFilters />
        <LabList />
      </main>

      <BottomNav />
    </div>
  )
}

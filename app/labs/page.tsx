import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { LabList } from "@/components/labs/lab-list"
import { LabFilters } from "@/components/labs/lab-filters"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export interface LabData {
  id: string
  name: string
  description: string | null
  address: string | null
  prefecture: string | null
  city: string | null
  phone: string | null
  email: string | null
  website_url: string | null
  delivery_days_min: number | null
  delivery_days_max: number | null
  price_min: number | null
  price_max: number | null
  service_area: string | null
  certifications: string[] | null
  track_record: number | null
  rating: number | null
  review_count: number | null
  is_featured: boolean
}

async function getLabs(): Promise<LabData[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase
    .from("labs")
    .select(
      "id, name, description, address, prefecture, city, phone, email, website_url, delivery_days_min, delivery_days_max, price_min, price_max, service_area, certifications, track_record, rating, review_count, is_featured"
    )
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false })

  if (error) {
    console.error("[v0] Labs fetch error:", error)
    return []
  }

  return (data as LabData[]) || []
}

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ detectionId?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const labs = await getLabs()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24 md:pb-6">
      <WaveHeader title="分析機関一覧" showLogo={false} />

      {resolvedParams.detectionId && (
        <div className="bg-emerald-50 border-b border-emerald-200">
          <div className="container mx-auto px-4 py-3 max-w-2xl">
            <p className="text-sm text-emerald-800">判定データの情報を引き継いで分析機関を検索できます</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <LabFilters />
        <LabList labs={labs} />
      </main>

      <BottomNav />
    </div>
  )
}

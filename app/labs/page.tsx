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
  postal_code: string | null
}

type SortOption = "rating" | "price" | "delivery" | "track-record"
type DeliveryFilter = "all" | "immediate" | "3days" | "1week"

async function getLabs(params: {
  prefectures?: string[]
  search?: string
  sort?: SortOption
  delivery?: DeliveryFilter
  zipcode?: string
}): Promise<LabData[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  let query = supabase
    .from("labs")
    .select(
      "id, name, description, address, prefecture, city, phone, email, website_url, delivery_days_min, delivery_days_max, price_min, price_max, service_area, certifications, track_record, rating, review_count, is_featured, postal_code"
    )
    .eq("is_active", true)

  // Prefecture filter
  if (params.prefectures && params.prefectures.length > 0) {
    query = query.in("prefecture", params.prefectures)
  }

  // Text search (name, address, city, prefecture)
  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,address.ilike.%${params.search}%,city.ilike.%${params.search}%,prefecture.ilike.%${params.search}%`
    )
  }

  // Delivery filter
  const del = params.delivery || "all"
  if (del === "immediate") {
    query = query.lte("delivery_days_min", 1)
  } else if (del === "3days") {
    query = query.lte("delivery_days_min", 3)
  } else if (del === "1week") {
    query = query.lte("delivery_days_min", 7)
  }

  // Sort (when zipcode is set, sorting is done client-side)
  if (!params.zipcode) {
    const sort = params.sort || "rating"
    switch (sort) {
      case "price":
        query = query
          .order("is_featured", { ascending: false })
          .order("price_min", { ascending: true, nullsFirst: false })
        break
      case "delivery":
        query = query
          .order("is_featured", { ascending: false })
          .order("delivery_days_min", { ascending: true, nullsFirst: false })
        break
      case "track-record":
        query = query
          .order("is_featured", { ascending: false })
          .order("track_record", { ascending: false, nullsFirst: false })
        break
      case "rating":
      default:
        query = query
          .order("is_featured", { ascending: false })
          .order("rating", { ascending: false })
        break
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Labs fetch error:", error)
    return []
  }

  const labs = (data as LabData[]) || []

  // 郵便番号が指定されている場合、全labを郵便番号の近さでソート
  if (params.zipcode) {
    const targetZip = parseInt(params.zipcode, 10)
    if (!isNaN(targetZip)) {
      labs.sort((a, b) => {
        // おすすめを優先
        const aFeatured = a.is_featured ? 0 : 1
        const bFeatured = b.is_featured ? 0 : 1
        if (aFeatured !== bFeatured) return aFeatured - bFeatured

        const aZip = a.postal_code ? parseInt(a.postal_code.replace(/[-ー－]/g, ""), 10) : NaN
        const bZip = b.postal_code ? parseInt(b.postal_code.replace(/[-ー－]/g, ""), 10) : NaN
        const aDiff = isNaN(aZip) ? Infinity : Math.abs(aZip - targetZip)
        const bDiff = isNaN(bZip) ? Infinity : Math.abs(bZip - targetZip)
        return aDiff - bDiff
      })
    }
  }

  return labs
}

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{
    detectionId?: string
    prefecture?: string | string[]
    search?: string
    sort?: string
    delivery?: string
    zipcode?: string
  }>
}) {
  const resolvedParams = await searchParams
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Normalize prefecture to array
  const prefectures = resolvedParams.prefecture
    ? Array.isArray(resolvedParams.prefecture)
      ? resolvedParams.prefecture
      : [resolvedParams.prefecture]
    : []

  const labs = await getLabs({
    prefectures,
    search: resolvedParams.search,
    sort: (resolvedParams.sort as SortOption) || "rating",
    delivery: (resolvedParams.delivery as DeliveryFilter) || "all",
    zipcode: resolvedParams.zipcode,
  })

  return (
    <div className="min-h-screen bg-gray-300 pb-24 md:pb-6">
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

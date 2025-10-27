import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type Detection = Database["public"]["Tables"]["detections"]["Row"]
type DetectionImage = Database["public"]["Tables"]["detection_images"]["Row"]

export interface DetectionWithImages extends Detection {
  images: DetectionImage[]
  user: { name: string } | null
  site_tag: { name: string; color: string } | null
}

export async function getDetections(
  companyId: string,
  filters?: {
    search?: string
    result?: boolean | null
    siteTagId?: string
    startDate?: string
    endDate?: string
  },
): Promise<DetectionWithImages[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("detections")
    .select(
      `
      *,
      images:detection_images(*),
      user:users!detections_user_id_fkey(name),
      site_tag:site_tags(name, color)
    `,
    )
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .order("detection_date", { ascending: false })

  // フィルター適用
  if (filters?.search) {
    query = query.or(
      `sample_name.ilike.%${filters.search}%,site_name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`,
    )
  }

  if (filters?.result !== undefined && filters?.result !== null) {
    query = query.eq("result", filters.result)
  }

  if (filters?.siteTagId) {
    query = query.eq("site_tag_id", filters.siteTagId)
  }

  if (filters?.startDate) {
    query = query.gte("detection_date", filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte("detection_date", filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching detections:", error)
    throw error
  }

  return (data as DetectionWithImages[]) || []
}

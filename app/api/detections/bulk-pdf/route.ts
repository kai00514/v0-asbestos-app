import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

const bulkPdfSchema = z.object({
  detection_ids: z.array(z.string().uuid()).min(1, "少なくとも1つの判定IDが必要です").max(50, "一度に50件までです"),
})

// POST /api/detections/bulk-pdf - 一括PDF生成
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const body = await request.json()

    // バリデーション
    const validatedData = bulkPdfSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // 判定データ取得
    const { data: detections, error } = await supabase
      .from("detections")
      .select("id, detection_number, sample_name")
      .in("id", validatedData.detection_ids)
      .eq("company_id", user.company_id)
      .eq("is_deleted", false)

    if (error) {
      console.error("[v0] Bulk PDF fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "判定データの取得に失敗しました")
    }

    if (!detections || detections.length === 0) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "指定された判定が見つかりません")
    }

    // TODO: 実際の一括PDF生成実装
    // ZIPファイルにまとめて返却するか、個別PDFのURLリストを返却

    return Response.json({
      data: {
        message: "一括PDF生成を開始しました",
        count: detections.length,
        detections: detections.map((d) => ({
          id: d.id,
          detection_number: d.detection_number,
          sample_name: d.sample_name,
        })),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

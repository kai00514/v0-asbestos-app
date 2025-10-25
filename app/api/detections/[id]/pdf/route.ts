import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { generateDetectionPDF } from "@/lib/pdf/generator"

// GET /api/detections/[id]/pdf - PDF生成・ダウンロード
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    // 判定データ取得（画像、BB、ユーザー、会社情報含む）
    const { data: detection, error } = await supabase
      .from("detections")
      .select(
        `
        *,
        detection_images(*, bounding_boxes(*)),
        users(id, name, email),
        companies(name, logo_url)
      `,
      )
      .eq("id", id)
      .eq("company_id", user.company_id)
      .eq("is_deleted", false)
      .single()

    if (error || !detection) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, "判定が見つかりません")
    }

    // PDF生成
    const pdfBuffer = await generateDetectionPDF({
      detection: {
        detection_number: detection.detection_number,
        sample_name: detection.sample_name,
        site_name: detection.site_name,
        detection_date: detection.detection_date,
        result: detection.result,
        confidence: detection.confidence,
        address: detection.address,
        notes: detection.notes,
      },
      company: {
        name: (detection as any).companies.name,
        logo_url: (detection as any).companies.logo_url,
      },
      user: {
        name: (detection as any).users.name,
        email: (detection as any).users.email,
      },
      images: (detection as any).detection_images.map((img: any) => ({
        original_url: img.original_url,
        bb_url: img.bb_url,
        bounding_boxes: img.bounding_boxes,
      })),
    })

    // ファイル名生成: Report_0001_20250101.pdf
    const dateStr = new Date(detection.detection_date).toISOString().split("T")[0].replace(/-/g, "")
    const filename = `Report_${String(detection.detection_number).padStart(4, "0")}_${dateStr}.pdf`

    // PDFレスポンス
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    return handleAPIError(error)
  }
}

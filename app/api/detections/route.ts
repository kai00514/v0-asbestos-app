import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { createDetectionSchema } from "@/lib/validations/detections"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse, paginatedResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { detectAsbestos } from "@/lib/ai/client"

// GET /api/detections - 判定一覧取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const { searchParams } = new URL(request.url)

    // クエリパラメータ
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "30"), 100)
    const result = searchParams.get("result") // "true" or "false"
    const siteTagId = searchParams.get("siteTagId")
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const supabase = await getSupabaseServerClient()

    // クエリ構築
    let query = supabase
      .from("detections")
      .select("*, detection_images(*), site_tags(*), users(id, name, email)", { count: "exact" })
      .eq("company_id", user.company_id)
      .eq("is_deleted", false)

    // フィルタ適用
    if (result !== null) {
      query = query.eq("result", result === "true")
    }
    if (siteTagId) {
      query = query.eq("site_tag_id", siteTagId)
    }
    if (userId) {
      query = query.eq("created_by", userId)
    }
    if (startDate) {
      query = query.gte("detection_date", startDate)
    }
    if (endDate) {
      query = query.lte("detection_date", endDate)
    }
    if (search) {
      query = query.or(`sample_name.ilike.%${search}%,site_name.ilike.%${search}%`)
    }

    // ソート
    query = query.order(sortBy as any, { ascending: sortOrder === "asc" })

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: detections, error, count } = await query

    if (error) {
      console.error("[v0] Detections fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "判定一覧の取得に失敗しました")
    }

    return paginatedResponse(detections || [], {
      page,
      limit,
      total: count || 0,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}

// POST /api/detections - AI判定実行
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const body = await request.json()

    // バリデーション
    const validatedData = createDetectionSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // 月次上限チェック
    const { data: usage } = await supabase.rpc("get_current_usage", {
      p_company_id: user.company_id,
    })

    if (usage && usage.current_count >= usage.monthly_limit) {
      throw new APIError(
        429,
        ErrorCodes.LIMIT_REACHED,
        "今月の判定上限に達しました。プランをアップグレードしてください。",
      )
    }

    // 画像バリデーション
    for (const image of validatedData.images) {
      const base64Data = image.data.split(",")[1] || image.data
      const buffer = Buffer.from(base64Data, "base64")

      // サイズチェック（10MB）
      if (buffer.length > 10 * 1024 * 1024) {
        throw new APIError(413, ErrorCodes.FILE_TOO_LARGE, `画像 ${image.filename} のサイズが10MBを超えています`)
      }
    }

    // AI推論実行（各画像）
    const aiResults = await Promise.all(validatedData.images.map((img) => detectAsbestos(img.data)))

    // 判定結果集約
    const hasAsbestos = aiResults.some((r) => r.has_asbestos)
    const avgConfidence = aiResults.reduce((sum, r) => sum + r.confidence, 0) / aiResults.length

    // detection_number自動採番
    const { data: lastDetection } = await supabase
      .from("detections")
      .select("detection_number")
      .eq("company_id", user.company_id)
      .order("detection_number", { ascending: false })
      .limit(1)
      .single()

    const nextNumber = lastDetection ? lastDetection.detection_number + 1 : 1

    // detectionsテーブルに保存
    const { data: detection, error: detectionError } = await supabase
      .from("detections")
      .insert({
        company_id: user.company_id,
        created_by: user.id,
        detection_number: nextNumber,
        sample_name: validatedData.sample_name,
        site_name: validatedData.site_name,
        site_tag_id: validatedData.site_tag_id,
        location: validatedData.location
          ? `POINT(${validatedData.location.longitude} ${validatedData.location.latitude})`
          : null,
        address: validatedData.address,
        result: hasAsbestos,
        confidence: avgConfidence,
        detection_date: new Date().toISOString(),
        model_version: aiResults[0].model_version,
      })
      .select()
      .single()

    if (detectionError) {
      console.error("[v0] Detection creation error:", detectionError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "判定結果の保存に失敗しました")
    }

    // 画像とバウンディングボックスを保存
    for (let i = 0; i < validatedData.images.length; i++) {
      const image = validatedData.images[i]
      const aiResult = aiResults[i]

      // TODO: Supabase Storageにアップロード
      // 現在はモックURLを使用
      const originalUrl = `/placeholder.svg?height=800&width=600&query=asbestos-sample-${i}`
      const bbUrl = `/placeholder.svg?height=800&width=600&query=asbestos-bb-${i}`
      const thumbnailUrl = `/placeholder.svg?height=300&width=300&query=asbestos-thumb-${i}`

      // detection_imagesテーブルに保存
      const { data: detectionImage, error: imageError } = await supabase
        .from("detection_images")
        .insert({
          detection_id: detection.id,
          original_url: originalUrl,
          bb_url: bbUrl,
          thumbnail_url: thumbnailUrl,
          filename: image.filename,
          order_index: i,
        })
        .select()
        .single()

      if (imageError) {
        console.error("[v0] Detection image creation error:", imageError)
        continue
      }

      // bounding_boxesテーブルに保存
      if (aiResult.bounding_boxes.length > 0) {
        const boundingBoxes = aiResult.bounding_boxes.map((bb) => ({
          detection_image_id: detectionImage.id,
          x: bb.x,
          y: bb.y,
          width: bb.width,
          height: bb.height,
          confidence: bb.confidence,
          class_name: bb.class,
        }))

        await supabase.from("bounding_boxes").insert(boundingBoxes)
      }
    }

    // 判定結果を再取得（画像含む）
    const { data: fullDetection } = await supabase
      .from("detections")
      .select("*, detection_images(*, bounding_boxes(*))")
      .eq("id", detection.id)
      .single()

    return successResponse(fullDetection, "AI判定が完了しました")
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

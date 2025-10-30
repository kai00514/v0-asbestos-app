import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { createDetectionSchema } from "@/lib/validations/detections"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse, paginatedResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { detectAsbestos } from "@/lib/ai/client"
import { createClient } from "@supabase/supabase-js"
import { uploadImageToStorage } from "@/lib/storage/upload"

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
      query = query.eq("user_id", userId)
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
    console.log("[v0] ========== POST /api/detections START ==========")

    const { user } = await requireAuth()
    console.log("[v0] User authenticated:", user.id, "company:", user.company_id)

    const body = await request.json()
    console.log("[v0] Request body received, images count:", body.images?.length)

    let validatedData
    try {
      validatedData = createDetectionSchema.parse(body)
      console.log("[v0] Validation passed")
    } catch (validationError) {
      console.error("[v0] Validation error:", JSON.stringify(validationError, null, 2))
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (validationError as any).errors)
    }

    const supabase = await getSupabaseServerClient()

    console.log("[v0] Creating Supabase admin client...")
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "x-client-info": "supabase-js-node",
        },
      },
    })
    console.log("[v0] Supabase admin client created successfully")

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

    console.log("[v0] Usage check passed:", usage?.current_count, "/", usage?.monthly_limit)

    console.log("[v0] ========== Starting image upload to Storage ==========")
    const imageUrls: string[] = []

    // detection_number自動採番（画像アップロード前に実行）
    const { data: lastDetection } = await supabaseAdmin
      .from("detections")
      .select("detection_number")
      .eq("company_id", user.company_id)
      .order("detection_number", { ascending: false })
      .limit(1)
      .single()

    const nextNumber = lastDetection ? lastDetection.detection_number + 1 : 1

    // detectionsテーブルに保存（画像処理前に作成）
    const { data: detection, error: detectionError } = await supabaseAdmin
      .from("detections")
      .insert({
        company_id: user.company_id,
        user_id: user.id,
        detection_number: nextNumber,
        sample_name: validatedData.sample_name,
        site_name: validatedData.site_name,
        site_tag_id: validatedData.site_tag_id,
        location: validatedData.location
          ? `POINT(${validatedData.location.longitude} ${validatedData.location.latitude})`
          : null,
        address: validatedData.address,
        result: false, // 仮の値、後で更新
        confidence: 0, // 仮の値、後で更新
        detection_date: new Date().toISOString(),
        ai_model_version: "unknown", // 仮の値、後で更新
      })
      .select()
      .single()

    if (detectionError) {
      console.error("[v0] Detection creation error:", detectionError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "判定結果の保存に失敗しました")
    }

    console.log("[v0] Detection created:", detection.id)

    for (let i = 0; i < validatedData.images.length; i++) {
      const image = validatedData.images[i]
      console.log(`[v0] ========== Uploading image ${i + 1}/${validatedData.images.length} ==========`)
      console.log(`[v0] Filename: ${image.filename}`)

      try {
        // Base64 → Buffer変換
        console.log(`[v0] Converting Base64 to Buffer...`)
        const base64Data = image.data.split(",")[1] || image.data
        const buffer = Buffer.from(base64Data, "base64")
        console.log(
          `[v0] Buffer created, size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`,
        )

        // サイズチェック（10MB）
        if (buffer.length > 10 * 1024 * 1024) {
          throw new APIError(413, ErrorCodes.FILE_TOO_LARGE, `画像 ${image.filename} のサイズが10MBを超えています`)
        }

        const timestamp = Date.now()
        const ext = image.filename.split(".").pop()?.toLowerCase() || "jpg"
        const fileName = `original_${i.toString().padStart(3, "0")}_${timestamp}.${ext}`
        const filePath = `${user.company_id}/${detection.id}/${fileName}`

        console.log(`[v0] Generated file path: ${filePath}`)

        const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`
        console.log(`[v0] Content-Type: ${contentType}`)

        console.log(`[v0] Calling uploadImageToStorage...`)
        const publicUrl = await uploadImageToStorage(buffer, filePath, contentType)

        console.log(`[v0] Upload successful!`)
        console.log(`[v0] Public URL:`, publicUrl)

        imageUrls.push(publicUrl)
        console.log(`[v0] ========== Image ${i + 1} upload completed successfully ==========`)
      } catch (uploadError) {
        console.error(`[v0] ========== EXCEPTION during image upload ==========`)
        console.error(`[v0] Exception:`, uploadError)
        throw uploadError
      }
    }

    console.log("[v0] ========== All images uploaded successfully ==========")
    console.log("[v0] Image URLs:", imageUrls)

    console.log("[v0] Starting AI inference with image URLs...")
    const CONCURRENT_LIMIT = 3
    const aiResults = []

    for (let i = 0; i < imageUrls.length; i += CONCURRENT_LIMIT) {
      const batch = imageUrls.slice(i, i + CONCURRENT_LIMIT)
      console.log(`[v0] Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}`)

      const batchResults = await Promise.all(
        batch.map(async (url, batchIndex) => {
          const actualIndex = i + batchIndex
          console.log(`[v0] AI inference for image ${actualIndex + 1}/${imageUrls.length}`)
          const result = await detectAsbestos(url)
          console.log(`[v0] Image ${actualIndex + 1} result:`, result.has_asbestos, "confidence:", result.confidence)
          return result
        }),
      )

      aiResults.push(...batchResults)
    }

    // 判定結果集約
    const hasAsbestos = aiResults.some((r) => r.has_asbestos)
    const avgConfidence = aiResults.reduce((sum, r) => sum + r.confidence, 0) / aiResults.length

    console.log("[v0] Overall result:", hasAsbestos, "avg confidence:", avgConfidence)

    const { error: updateError } = await supabaseAdmin
      .from("detections")
      .update({
        result: hasAsbestos,
        confidence: avgConfidence,
        ai_model_version: aiResults[0].model_version || "unknown",
      })
      .eq("id", detection.id)

    if (updateError) {
      console.error("[v0] Detection update error:", updateError)
    }

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i]
      const image = validatedData.images[i]
      const aiResult = aiResults[i]

      try {
        console.log(`[v0] Saving detection image ${i + 1}/${imageUrls.length}`)

        // detection_imagesテーブルに保存（BB画像とサムネイルはnull）
        const { data: detectionImage, error: imageError } = await supabaseAdmin
          .from("detection_images")
          .insert({
            detection_id: detection.id,
            original_url: imageUrl,
            bb_url: null, // No BB image generation
            thumbnail_url: null, // No thumbnail generation
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

          const { error: bbError } = await supabaseAdmin.from("bounding_boxes").insert(boundingBoxes)

          if (bbError) {
            console.error("[v0] Bounding boxes creation error:", bbError)
          }
        }

        console.log(`[v0] Detection image ${i + 1} saved successfully`)
      } catch (imageError) {
        console.error(`[v0] Error processing image ${i}:`, imageError)
        // 個別の画像エラーは続行
      }
    }

    // 判定結果を再取得（画像含む）
    const { data: fullDetection } = await supabaseAdmin
      .from("detections")
      .select("*, detection_images(*, bounding_boxes(*))")
      .eq("id", detection.id)
      .single()

    console.log("[v0] ========== AI detection completed successfully ==========")

    return successResponse(fullDetection, "AI判定が完了しました")
  } catch (error) {
    console.error("[v0] ========== AI detection error ==========")
    console.error("[v0] Error:", error)

    if (error instanceof Error) {
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }

    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { createDetectionSchema } from "@/lib/validations/detections"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse, paginatedResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { detectAsbestos } from "@/lib/ai/client"
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

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

    console.log("[v0] Starting AI detection for user:", user.id, "company:", user.company_id)

    // バリデーション
    const validatedData = createDetectionSchema.parse(body)
    console.log("[v0] Validated data, image count:", validatedData.images.length)

    const supabase = await getSupabaseServerClient()

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
      },
    })

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

    console.log("[v0] Starting AI inference for", validatedData.images.length, "images")

    const CONCURRENT_LIMIT = 3
    const aiResults = []

    for (let i = 0; i < validatedData.images.length; i += CONCURRENT_LIMIT) {
      const batch = validatedData.images.slice(i, i + CONCURRENT_LIMIT)
      console.log(`[v0] Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}`)

      const batchResults = await Promise.all(
        batch.map(async (img, batchIndex) => {
          const actualIndex = i + batchIndex
          console.log(`[v0] Processing image ${actualIndex + 1}/${validatedData.images.length}`)
          const result = await detectAsbestos(img.data)
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
        model_version: aiResults[0].model_version || "unknown",
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
      const aiResult = aiResults[i]

      try {
        console.log(`[v0] Uploading image ${i + 1}/${validatedData.images.length}`)

        // Base64 → Buffer変換
        const base64Data = image.data.split(",")[1] || image.data
        const buffer = Buffer.from(base64Data, "base64")

        // ファイル名生成
        const timestamp = Date.now()
        const ext = image.filename.split(".").pop() || "jpg"
        const originalFileName = `original_${i.toString().padStart(3, "0")}_${timestamp}.${ext}`
        const originalFilePath = `${user.company_id}/${detection.id}/${originalFileName}`

        // オリジナル画像をStorageにアップロード
        const { error: uploadError } = await supabaseAdmin.storage
          .from("detection-images")
          .upload(originalFilePath, buffer, {
            contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
            upsert: false,
          })

        if (uploadError) {
          console.error(`[v0] Failed to upload image ${i}:`, uploadError)
          throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`)
        }

        // 公開URLを取得
        const { data: originalUrlData } = supabaseAdmin.storage.from("detection-images").getPublicUrl(originalFilePath)
        const originalUrl = originalUrlData.publicUrl

        console.log(`[v0] Image ${i + 1} uploaded:`, originalUrl)

        // バウンディングボックスつき画像を生成
        let bbUrl = originalUrl
        if (aiResult.bounding_boxes.length > 0) {
          try {
            const imageSharp = sharp(buffer)
            const metadata = await imageSharp.metadata()

            // SVGでバウンディングボックスを描画
            const svgOverlay = `
              <svg width="${metadata.width}" height="${metadata.height}">
                ${aiResult.bounding_boxes
                  .map(
                    (bb) => `
                  <rect 
                    x="${bb.x - bb.width / 2}" 
                    y="${bb.y - bb.height / 2}" 
                    width="${bb.width}" 
                    height="${bb.height}" 
                    fill="none" 
                    stroke="red" 
                    stroke-width="4"
                  />
                  <text 
                    x="${bb.x - bb.width / 2 + 5}" 
                    y="${bb.y - bb.height / 2 - 10}" 
                    fill="red" 
                    font-size="20" 
                    font-weight="bold"
                    style="text-shadow: 1px 1px 2px black"
                  >
                    ${(bb.confidence * 100).toFixed(1)}%
                  </text>
                `,
                  )
                  .join("")}
              </svg>
            `

            // 画像にオーバーレイを合成
            const bbImageBuffer = await imageSharp
              .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
              .jpeg()
              .toBuffer()

            // BBつき画像をStorageにアップロード
            const bbFileName = `bb_${i.toString().padStart(3, "0")}_${timestamp}.jpg`
            const bbFilePath = `${user.company_id}/${detection.id}/${bbFileName}`

            await supabaseAdmin.storage.from("detection-images").upload(bbFilePath, bbImageBuffer, {
              contentType: "image/jpeg",
              upsert: false,
            })

            const { data: bbUrlData } = supabaseAdmin.storage.from("detection-images").getPublicUrl(bbFilePath)
            bbUrl = bbUrlData.publicUrl

            console.log(`[v0] BB image ${i + 1} created:`, bbUrl)
          } catch (bbError) {
            console.error(`[v0] Failed to create BB image ${i}:`, bbError)
            // BB画像生成失敗時はオリジナル画像を使用
          }
        }

        // サムネイル生成
        const thumbnailBuffer = await sharp(buffer).resize(300, 300, { fit: "cover" }).jpeg().toBuffer()

        const thumbFileName = `thumb_${i.toString().padStart(3, "0")}_${timestamp}.jpg`
        const thumbFilePath = `${user.company_id}/${detection.id}/${thumbFileName}`

        await supabaseAdmin.storage.from("detection-images").upload(thumbFilePath, thumbnailBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        })

        const { data: thumbUrlData } = supabaseAdmin.storage.from("detection-images").getPublicUrl(thumbFilePath)
        const thumbnailUrl = thumbUrlData.publicUrl

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

          const { error: bbError } = await supabase.from("bounding_boxes").insert(boundingBoxes)

          if (bbError) {
            console.error("[v0] Bounding boxes creation error:", bbError)
          }
        }
      } catch (imageError) {
        console.error(`[v0] Error processing image ${i}:`, imageError)
        // 個別の画像エラーは続行
      }
    }

    // 判定結果を再取得（画像含む）
    const { data: fullDetection } = await supabase
      .from("detections")
      .select("*, detection_images(*, bounding_boxes(*))")
      .eq("id", detection.id)
      .single()

    console.log("[v0] AI detection completed successfully")

    return successResponse(fullDetection, "AI判定が完了しました")
  } catch (error) {
    console.error("[v0] AI detection error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

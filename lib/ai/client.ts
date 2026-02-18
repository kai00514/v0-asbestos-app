export interface AIDetectionResult {
  has_asbestos: boolean
  confidence: number
  detection_count: number
  bounding_boxes: Array<{
    x: number
    y: number
    width: number
    height: number
    confidence: number
    class: string
  }>
  model_version?: string
  processing_time_ms?: number
}

export async function detectAsbestos(imageUrl: string): Promise<AIDetectionResult> {
  const apiKey = process.env.ROBOFLOW_API_KEY
  const workflowUrl = process.env.ROBOFLOW_WORKFLOW_URL

  console.log("[v0] detectAsbestos called with URL:", imageUrl.slice(0, 100))
  console.log("[v0] ROBOFLOW_API_KEY exists:", !!apiKey)
  console.log("[v0] ROBOFLOW_WORKFLOW_URL:", workflowUrl)

  if (!apiKey || !workflowUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Roboflow API credentials are not configured. Please set ROBOFLOW_API_KEY and ROBOFLOW_WORKFLOW_URL.")
    }
    console.warn("[v0] Roboflow credentials not set, using mock response (development only)")
    return getMockResponse()
  }

  const startTime = Date.now()

  try {
    console.log("[v0] Calling Roboflow API for asbestos detection")

    const response = await fetch(workflowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        inputs: {
          image: {
            type: "url",
            value: imageUrl,
          },
        },
      }),
      signal: AbortSignal.timeout(30000), // 30秒タイムアウト
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Roboflow API error:", response.status, errorText)
      throw new Error(`Roboflow API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Roboflow API response:", JSON.stringify(result, null, 2))

    const detectionCount = result.outputs?.[0]?.count_objects || 0
    const predictions = result.outputs?.[0]?.predictions?.predictions || []

    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / predictions.length
        : 0

    return {
      has_asbestos: detectionCount > 0,
      confidence: avgConfidence,
      detection_count: detectionCount,
      bounding_boxes: predictions.map((p: any) => ({
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        confidence: p.confidence,
        class: p.class || "asbestos",
      })),
      model_version: "roboflow-v1",
      processing_time_ms: Date.now() - startTime,
    }
  } catch (error) {
    console.error("[v0] AI detection error:", error)
    if (process.env.NODE_ENV === "production") {
      // 本番環境ではエラーをそのまま投げる（モックに逃げない）
      throw error
    }
    // 開発環境のみモックにフォールバック
    console.warn("[v0] Falling back to mock response (development only)")
    return getMockResponse()
  }
}

// モックレスポンス（開発・テスト用）
function getMockResponse(): AIDetectionResult {
  console.log("[v0] Using mock AI response")
  const hasAsbestos = Math.random() > 0.5
  const confidence = hasAsbestos ? 0.85 + Math.random() * 0.15 : 0.1 + Math.random() * 0.3

  return {
    has_asbestos: hasAsbestos,
    confidence: confidence,
    detection_count: hasAsbestos ? 1 : 0,
    bounding_boxes: hasAsbestos
      ? [
          {
            x: 400,
            y: 300,
            width: 200,
            height: 180,
            confidence: confidence,
            class: "chrysotile",
          },
        ]
      : [],
    model_version: "mock-v1",
    processing_time_ms: 1000,
  }
}

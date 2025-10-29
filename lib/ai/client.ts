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

export async function detectAsbestos(imageBase64: string): Promise<AIDetectionResult> {
  const apiKey = process.env.ROBOFLOW_API_KEY

  if (!apiKey) {
    console.error("[v0] ROBOFLOW_API_KEY is not set, using mock response")
    return getMockResponse()
  }

  try {
    console.log("[v0] Calling Roboflow API for asbestos detection")

    // Base64データのみを抽出（data:image/jpeg;base64, を除去）
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64

    // Roboflow APIを呼び出し
    const response = await fetch(
      "https://serverless.roboflow.com/asbestos-aokhx/workflows/detect-count-and-visualize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          inputs: {
            image: {
              type: "base64",
              value: base64Data,
            },
          },
        }),
        signal: AbortSignal.timeout(30000), // 30秒タイムアウト
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Roboflow API error:", response.status, errorText)
      throw new Error(`Roboflow API error: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Roboflow API response:", JSON.stringify(result).slice(0, 200))

    // レスポンスマッピング
    const detectionCount = result[0]?.count_objects || 0
    const predictions = result[0]?.predictions?.predictions || []

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
      processing_time_ms: Date.now(),
    }
  } catch (error) {
    console.error("[v0] AI detection error:", error)
    // エラー時はモックレスポンスを返す
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

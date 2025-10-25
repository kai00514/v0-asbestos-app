// AI推論APIクライアント（モック実装）
export interface AIDetectionResult {
  has_asbestos: boolean
  confidence: number
  bounding_boxes: Array<{
    x: number
    y: number
    width: number
    height: number
    confidence: number
    class: string
  }>
  model_version: string
  processing_time_ms: number
}

export async function detectAsbestos(imageBase64: string): Promise<AIDetectionResult> {
  // TODO: 実際のAI APIに接続
  // 現在はモック実装
  console.log("[v0] AI detection called (mock)")

  // モックレスポンス
  await new Promise((resolve) => setTimeout(resolve, 1000)) // 1秒待機

  const hasAsbestos = Math.random() > 0.5
  const confidence = hasAsbestos ? 0.85 + Math.random() * 0.15 : 0.1 + Math.random() * 0.3

  return {
    has_asbestos: hasAsbestos,
    confidence: confidence,
    bounding_boxes: hasAsbestos
      ? [
          {
            x: 100,
            y: 150,
            width: 200,
            height: 180,
            confidence: confidence,
            class: "chrysotile",
          },
        ]
      : [],
    model_version: "v2.1",
    processing_time_ms: 1234,
  }
}

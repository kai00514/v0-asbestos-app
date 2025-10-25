// PDF生成ユーティリティ（モック実装）
// 実際の実装ではPDFKitやPuppeteerを使用

export interface DetectionPDFData {
  detection: {
    detection_number: number
    sample_name: string
    site_name: string
    detection_date: string
    result: boolean
    confidence: number
    address?: string
    notes?: string
  }
  company: {
    name: string
    logo_url?: string
  }
  user: {
    name: string
    email: string
  }
  images: Array<{
    original_url: string
    bb_url: string
    bounding_boxes: Array<{
      x: number
      y: number
      width: number
      height: number
      confidence: number
      class_name: string
    }>
  }>
}

export async function generateDetectionPDF(data: DetectionPDFData): Promise<Buffer> {
  // TODO: 実際のPDF生成実装
  // PDFKitまたはPuppeteerを使用してPDFを生成

  console.log("[v0] Generating PDF for detection:", data.detection.detection_number)

  // モック実装：簡単なテキストベースのPDF風データ
  const pdfContent = `
アスベスト判定報告書
==================

判定番号: ${String(data.detection.detection_number).padStart(4, "0")}
判定日: ${new Date(data.detection.detection_date).toLocaleDateString("ja-JP")}

会社情報
--------
会社名: ${data.company.name}

サンプル情報
-----------
サンプル名: ${data.detection.sample_name}
現場名: ${data.detection.site_name}
住所: ${data.detection.address || "未設定"}

判定結果
--------
結果: ${data.detection.result ? "アスベスト検出あり" : "アスベスト検出なし"}
信頼度: ${(data.detection.confidence * 100).toFixed(1)}%

画像数: ${data.images.length}枚
バウンディングボックス数: ${data.images.reduce((sum, img) => sum + img.bounding_boxes.length, 0)}個

備考
----
${data.detection.notes || "なし"}

判定者: ${data.user.name} (${data.user.email})
  `.trim()

  // テキストをBufferに変換（実際のPDFではない）
  return Buffer.from(pdfContent, "utf-8")
}

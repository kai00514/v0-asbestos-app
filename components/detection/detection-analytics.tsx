import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BoundingBoxData {
  id: string
  confidence: number
  class_name: string
  detection_image_id: string
}

interface DetectionImageData {
  id: string
  caption: string | null
  order: number
  bounding_boxes: BoundingBoxData[]
}

interface DetectionAnalyticsData {
  id: string
  detection_count: number | null
  processing_time_ms: number | null
  ai_model_version: string | null
  detection_images: DetectionImageData[]
}

async function getAnalyticsData(id: string): Promise<DetectionAnalyticsData | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase
    .from("detections")
    .select(`
      id,
      detection_count,
      processing_time_ms,
      ai_model_version,
      detection_images(
        id,
        caption,
        order,
        bounding_boxes(id, confidence, class_name, detection_image_id)
      )
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("DetectionAnalytics - Error:", error)
    return null
  }

  return data as DetectionAnalyticsData | null
}

function getBBColorClass(confidence: number): string {
  if (confidence >= 0.8) return "[&>div]:bg-red-500 bg-red-100"
  if (confidence >= 0.6) return "[&>div]:bg-orange-500 bg-orange-100"
  return "[&>div]:bg-yellow-500 bg-yellow-100"
}

function getBBTextColor(confidence: number): string {
  if (confidence >= 0.8) return "text-red-600"
  if (confidence >= 0.6) return "text-orange-600"
  return "text-yellow-600"
}

export async function DetectionAnalytics({ id }: { id: string }) {
  const data = await getAnalyticsData(id)

  if (!data) return null

  // 全BBをフラット化
  const allBBs = data.detection_images.flatMap((img) => img.bounding_boxes || [])

  if (allBBs.length === 0 && !data.detection_count && !data.processing_time_ms) {
    return null
  }

  // クラス別集計
  const classCounts = new Map<string, { count: number; totalConfidence: number }>()
  allBBs.forEach((bb) => {
    const existing = classCounts.get(bb.class_name) || { count: 0, totalConfidence: 0 }
    existing.count += 1
    existing.totalConfidence += bb.confidence
    classCounts.set(bb.class_name, existing)
  })
  const classEntries = Array.from(classCounts.entries()).sort((a, b) => b[1].count - a[1].count)

  const detectionCount = data.detection_count || allBBs.length

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-900">検出分析</h2>

        {/* サマリー統計 - 3カラムグリッド */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{detectionCount}</p>
            <p className="text-xs text-gray-500 mt-1">検出数</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-gray-900 truncate">{data.ai_model_version || "—"}</p>
            <p className="text-xs text-gray-500 mt-1">AIモデル</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {data.processing_time_ms != null
                ? data.processing_time_ms < 1000
                  ? `${data.processing_time_ms}ms`
                  : `${(data.processing_time_ms / 1000).toFixed(1)}s`
                : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">処理時間</p>
          </div>
        </div>

        {/* クラス別検出 */}
        {classEntries.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">クラス別検出</h3>
            <div className="space-y-2">
              {classEntries.map(([className, stats]) => {
                const avgConf = stats.totalConfidence / stats.count
                return (
                  <div key={className} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-28 truncate">{className}</span>
                    <span className="text-xs text-gray-500 w-10 text-right">{stats.count}件</span>
                    <div className="flex-1">
                      <Progress
                        value={avgConf * 100}
                        className={`h-2 ${getBBColorClass(avgConf)}`}
                      />
                    </div>
                    <span className={`text-xs font-mono w-14 text-right ${getBBTextColor(avgConf)}`}>
                      {(avgConf * 100).toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 画像別検出数（複数画像時） */}
        {data.detection_images.length > 1 && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">画像別検出数</h3>
            <div className="space-y-1.5">
              {data.detection_images
                .sort((a, b) => a.order - b.order)
                .map((img, idx) => (
                  <div key={img.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">画像 {idx + 1}</span>
                    <span className="font-medium text-gray-900">{img.bounding_boxes?.length || 0}件</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 個別BB信頼度リスト */}
        {allBBs.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">個別検出信頼度</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allBBs
                .sort((a, b) => b.confidence - a.confidence)
                .map((bb, idx) => (
                  <div key={bb.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}</span>
                    <span className="text-sm text-gray-700 w-28 truncate">{bb.class_name}</span>
                    <div className="flex-1">
                      <Progress
                        value={bb.confidence * 100}
                        className={`h-1.5 ${getBBColorClass(bb.confidence)}`}
                      />
                    </div>
                    <span className={`text-xs font-mono w-14 text-right ${getBBTextColor(bb.confidence)}`}>
                      {(bb.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

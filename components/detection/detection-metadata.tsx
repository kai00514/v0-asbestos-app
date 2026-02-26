import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DetectionData {
  id: string
  detection_number: number
  sample_name: string
  site_name: string
  result: boolean
  confidence: number
  detection_date: string
  address: string | null
  location: unknown
  location_accuracy: number | null
  notes: string | null
  user: { name: string } | null
  site_tag: { name: string; color: string } | null
}

async function getDetectionData(id: string): Promise<DetectionData | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase
    .from("detections")
    .select(`
      id,
      detection_number,
      sample_name,
      site_name,
      result,
      confidence,
      detection_date,
      address,
      location,
      location_accuracy,
      notes,
      user:users!detections_user_id_fkey(name),
      site_tag:site_tags(name, color)
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[v0] DetectionMetadata - Error:", error)
    return null
  }

  return data as DetectionData | null
}

function formatDetectionNumber(num: number): string {
  return `ASB-${String(num).padStart(4, "0")}`
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "高信頼度"
  if (confidence >= 0.7) return "中信頼度"
  return "低信頼度"
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return "text-emerald-600"
  if (confidence >= 0.7) return "text-yellow-600"
  return "text-red-600"
}

function formatLocation(location: unknown): { lat: string; lng: string } | null {
  if (!location) return null
  // PostGISのPOINT型またはJSON形式
  if (typeof location === "string") {
    const match = location.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/)
    if (match) {
      return { lng: parseFloat(match[1]).toFixed(4) + "°", lat: parseFloat(match[2]).toFixed(4) + "°" }
    }
  }
  if (typeof location === "object" && location !== null) {
    const loc = location as { coordinates?: [number, number]; lat?: number; lng?: number }
    if (loc.coordinates) {
      return { lng: loc.coordinates[0].toFixed(4) + "°", lat: loc.coordinates[1].toFixed(4) + "°" }
    }
    if (loc.lat !== undefined && loc.lng !== undefined) {
      return { lat: loc.lat.toFixed(4) + "°", lng: loc.lng.toFixed(4) + "°" }
    }
  }
  return null
}

export async function DetectionMetadata({ id }: { id: string }) {
  const detection = await getDetectionData(id)

  if (!detection) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6 text-center text-gray-500">
          判定データが見つかりませんでした。
        </CardContent>
      </Card>
    )
  }

  const confidencePercent = Math.round(detection.confidence * 100)
  const confidenceLabel = getConfidenceLabel(detection.confidence)
  const confidenceColor = getConfidenceColor(detection.confidence)
  const formattedDate = new Date(detection.detection_date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
  const userName = detection.user?.name || "不明"
  const location = formatLocation(detection.location)

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6 space-y-5">
        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">判定番号</h2>
          <p className="text-xl font-bold text-gray-900 font-mono">{formatDetectionNumber(detection.detection_number)}</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">試料名称</h2>
          <p className="text-base font-medium text-gray-900">{detection.sample_name}</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">現場名称</h2>
          {detection.site_tag ? (
            <Badge
              variant="secondary"
              style={{
                backgroundColor: detection.site_tag.color + "20",
                color: detection.site_tag.color,
                borderColor: detection.site_tag.color + "40",
              }}
              className="border"
            >
              {detection.site_tag.name}
            </Badge>
          ) : (
            <p className="text-base text-gray-900">{detection.site_name || "未設定"}</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">判定結果</h2>
          <Badge
            variant={detection.result ? "destructive" : "default"}
            className={`text-sm px-4 py-1.5 ${!detection.result ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          >
            {detection.result ? "含有あり" : "含有なし"}
          </Badge>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">信頼度</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className={`text-2xl font-bold ${confidenceColor}`}>{confidencePercent}%</span>
              <span className="text-sm text-gray-600">{confidenceLabel}</span>
            </div>
            <Progress
              value={confidencePercent}
              className={`h-2 ${
                confidencePercent >= 90
                  ? "[&>div]:bg-emerald-500 bg-emerald-100"
                  : confidencePercent >= 70
                    ? "[&>div]:bg-yellow-500 bg-yellow-100"
                    : "[&>div]:bg-red-500 bg-red-100"
              }`}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">判定日</h2>
          <p className="text-base text-gray-900">{formattedDate}</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">位置情報</h2>
          <div className="space-y-1">
            {detection.address ? (
              <p className="text-base text-gray-900">{detection.address}</p>
            ) : (
              <p className="text-base text-gray-400">住所未登録</p>
            )}
            {location && (
              <p className="text-sm text-gray-500">{location.lat} N, {location.lng} E</p>
            )}
            {detection.location_accuracy && (
              <p className="text-xs text-gray-400">精度: 半径 約{Math.round(detection.location_accuracy)}m</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">担当者</h2>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">{userName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-base text-gray-900">{userName}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">備考</h2>
          {detection.notes ? (
            <p className="text-base text-gray-700 leading-relaxed">{detection.notes}</p>
          ) : (
            <p className="text-base text-gray-400">備考なし</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

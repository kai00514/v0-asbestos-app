import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRight, Calendar, MapPin, User } from "lucide-react"
import type { DetectionWithImages } from "@/lib/api/detections"

interface DetectionListProps {
  detections: DetectionWithImages[]
}

export function DetectionList({ detections }: DetectionListProps) {
  if (detections.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">まだ判定データが存在しません</p>
        <p className="text-sm text-gray-500 mt-2">AI判定を実行すると、ここに結果が表示されます。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">全{detections.length}件</p>
      </div>

      <div className="space-y-3">
        {detections.map((detection) => {
          const resultText = detection.result ? "含有あり" : "含有なし"
          const resultType = detection.result ? "detected" : "not-detected"
          const formattedDate = new Date(detection.detection_date).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          const thumbnail = detection.images?.[0]?.thumbnail_url || "/placeholder.svg"
          const userName = detection.user?.name || "不明"
          const siteTagName = detection.site_tag?.name || detection.site_name
          const confidence = detection.confidence
            ? `${(detection.confidence * 100).toFixed(0)}%`
            : null

          return (
            <Link key={detection.id} href={`/detection/${detection.id}`}>
              <Card className="p-4 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer bg-white border border-gray-100 rounded-xl group">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={thumbnail || "/placeholder.svg"}
                      alt={detection.sample_name}
                      className="w-full h-full object-cover"
                    />
                    {confidence && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 font-medium">
                        信頼度 {confidence}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{detection.sample_name}</h3>
                      <Badge
                        variant={resultType === "detected" ? "destructive" : "default"}
                        className={`flex-shrink-0 text-xs ${resultType === "not-detected" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                      >
                        {resultText}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                      {siteTagName && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal border-gray-200">
                          {siteTagName}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">{userName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">{userName}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 self-center group-hover:text-emerald-500 transition-colors" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

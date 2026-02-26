import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRight, Calendar, MapPin, Shield, AlertTriangle } from "lucide-react"
import type { DetectionWithImages } from "@/lib/api/detections"

interface DetectionListProps {
  detections: DetectionWithImages[]
}

export function DetectionList({ detections }: DetectionListProps) {
  if (detections.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-700 font-semibold">まだ判定データが存在しません</p>
        <p className="text-sm text-gray-500 mt-2">AI判定を実行すると、ここに結果が表示されます。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm font-semibold text-gray-500">全 {detections.length} 件</p>
      </div>

      <div className="space-y-2.5">
        {detections.map((detection) => {
          const isDetected = detection.result === true
          const resultText = isDetected ? "含有あり" : "含有なし"
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
              <div className={`
                group relative backdrop-blur-xl rounded-2xl p-4 cursor-pointer transition-all duration-200
                ${isDetected
                  ? "bg-white/80 border-2 border-red-200/80 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/50"
                  : "bg-white/80 border-2 border-emerald-200/60 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50"
                }
              `}>
                {/* 結果インジケーター（左側のアクセントライン） */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${isDetected ? "bg-red-400" : "bg-emerald-400"}`} />

                <div className="flex gap-3.5 pl-2">
                  {/* サムネイル */}
                  <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 shadow-md shadow-gray-200/60 ring-1 ring-gray-200/50">
                    <img
                      src={thumbnail || "/placeholder.svg"}
                      alt={detection.sample_name}
                      className="w-full h-full object-cover"
                    />
                    {confidence && (
                      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/50 text-white text-[10px] text-center py-0.5 font-semibold tracking-wide">
                        {confidence}
                      </div>
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-[13px] leading-tight truncate">{detection.sample_name}</h3>
                      <Badge
                        variant={isDetected ? "destructive" : "default"}
                        className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-lg shadow-sm ${
                          isDetected
                            ? "bg-red-500/90 hover:bg-red-600 border border-red-400/50"
                            : "bg-emerald-500/90 hover:bg-emerald-600 border border-emerald-400/50"
                        }`}
                      >
                        {isDetected ? (
                          <><AlertTriangle className="w-3 h-3 mr-0.5" />{resultText}</>
                        ) : (
                          <><Shield className="w-3 h-3 mr-0.5" />{resultText}</>
                        )}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formattedDate}
                      </span>
                      {siteTagName && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100/80 text-gray-600 border border-gray-200/60 font-medium">
                          {siteTagName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <Avatar className="w-5 h-5 ring-1 ring-gray-200/50">
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-semibold">{userName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-gray-500 font-medium">{userName}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 self-center group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

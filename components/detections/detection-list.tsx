import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"
import type { DetectionWithImages } from "@/lib/api/detections"

interface DetectionListProps {
  detections: DetectionWithImages[]
}

export function DetectionList({ detections }: DetectionListProps) {
  if (detections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">まだ判定データが存在しません。</p>
        <p className="text-sm text-gray-500 mt-2">AI判定を実行すると、ここに結果が表示されます。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">全{detections.length}件</p>

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

        return (
          <Link key={detection.id} href={`/detection/${detection.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-4">
                <img
                  src={thumbnail || "/placeholder.svg"}
                  alt={detection.sample_name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-2">{detection.sample_name}</h3>
                  <Badge
                    variant={resultType === "detected" ? "destructive" : "default"}
                    className={resultType === "not-detected" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {resultText}
                  </Badge>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <span>{formattedDate}</span>
                    {siteTagName && (
                      <Badge variant="outline" className="text-xs">
                        {siteTagName}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{userName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">{userName}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

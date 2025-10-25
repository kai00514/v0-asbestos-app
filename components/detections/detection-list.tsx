import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"

const detections = [
  {
    id: "0001",
    name: "外壁 スレート版",
    result: "含有あり",
    resultType: "detected",
    date: "2025/10/22",
    site: "渋谷現場",
    user: "田中太郎",
    thumbnail: "/asbestos-slate.jpg",
  },
  {
    id: "0002",
    name: "屋根材",
    result: "含有なし",
    resultType: "not-detected",
    date: "2025/10/21",
    site: "新宿現場",
    user: "佐藤花子",
    thumbnail: "/roof-material.jpg",
  },
  {
    id: "0003",
    name: "天井材",
    result: "未判定",
    resultType: "pending",
    date: "2025/10/20",
    site: "品川現場",
    user: "鈴木一郎",
    thumbnail: "/ceiling-material.jpg",
  },
]

export function DetectionList() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">全{detections.length}件</p>

      {detections.map((detection) => (
        <Link key={detection.id} href={`/detection/${detection.id}`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex gap-4">
              <img
                src={detection.thumbnail || "/placeholder.svg"}
                alt={detection.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-2">{detection.name}</h3>
                <Badge
                  variant={
                    detection.resultType === "detected"
                      ? "destructive"
                      : detection.resultType === "not-detected"
                        ? "default"
                        : "secondary"
                  }
                  className={detection.resultType === "not-detected" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  {detection.result}
                </Badge>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span>{detection.date}</span>
                  <Badge variant="outline" className="text-xs">
                    {detection.site}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{detection.user[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{detection.user}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

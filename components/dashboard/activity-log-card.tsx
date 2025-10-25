import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "detection",
    user: "田中太郎",
    action: "外壁スレート版を判定しました",
    site: "渋谷現場",
    time: "3時間前",
    icon: CheckCircle,
  },
  {
    id: 2,
    type: "edit",
    user: "佐藤花子",
    action: "屋根材の判定を編集しました",
    site: "新宿現場",
    time: "5時間前",
    icon: Edit,
  },
  {
    id: 3,
    type: "detection",
    user: "鈴木一郎",
    action: "天井材を判定しました",
    site: "品川現場",
    time: "1日前",
    icon: CheckCircle,
  },
]

export function ActivityLogCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>直近の判定活動</CardTitle>
        <Link href="/detections" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          もっと見る
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">{activity.user}</span>
                  <span className="text-gray-600"> が {activity.action}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {activity.site}
                  </Badge>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

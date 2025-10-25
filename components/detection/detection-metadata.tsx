import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DetectionMetadata({ id }: { id: string }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-sm text-gray-600 mb-1">判定番号</h2>
          <p className="text-2xl font-bold text-gray-900">{id}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">試料名称</h2>
          <p className="text-lg font-medium">外壁 スレート版</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">現場名称</h2>
          <Badge variant="secondary">渋谷現場</Badge>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">判定結果</h2>
          <Badge variant="destructive" className="text-base px-4 py-1">
            含有あり
          </Badge>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">信頼度</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-emerald-600">92%</span>
              <span className="text-sm text-gray-600">高信頼度</span>
            </div>
            <Progress value={92} className="h-2 bg-emerald-100" />
          </div>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">判定日</h2>
          <p className="text-base">2025/10/22 19:01</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">位置情報</h2>
          <div className="space-y-1">
            <p className="text-base">東京都渋谷区渋谷1-1-1</p>
            <p className="text-sm text-gray-500">35.6812° N, 139.7671° E</p>
            <p className="text-xs text-gray-400">精度: 半径 約15m</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">担当者</h2>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>田</AvatarFallback>
            </Avatar>
            <span className="text-base">田中太郎</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm text-gray-600 mb-2">備考</h2>
          <p className="text-base text-gray-700">外壁の劣化が見られるため、早急な対応が必要です。</p>
        </div>
      </CardContent>
    </Card>
  )
}

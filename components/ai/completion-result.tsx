"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CompletionResult({ detectionId }: { detectionId: string }) {
  const confidence = 92
  const result = "含有あり"
  const isLowConfidence = confidence < 70

  return (
    <div className="space-y-6">
      {/* 結果バッジ */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">判定完了</h2>
          <Badge variant="destructive" className="text-xl px-6 py-2">
            {result}
          </Badge>
        </CardContent>
      </Card>

      {/* 信頼度 */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className="text-lg font-medium">信頼度</h3>
            <span className="text-3xl font-bold text-emerald-600">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-3 bg-emerald-100" />
          <p className="text-sm text-gray-600">高信頼度</p>

          {isLowConfidence && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                信頼度が低い結果です。専門機関への依頼を推奨します。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 画像プレビュー */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="original" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="original">元画像</TabsTrigger>
              <TabsTrigger value="bb">BB画像</TabsTrigger>
            </TabsList>
            <TabsContent value="original">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img src="/asbestos-detection-original.jpg" alt="元画像" className="w-full h-full object-contain" />
              </div>
            </TabsContent>
            <TabsContent value="bb">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img src="/asbestos-detection-original.jpg" alt="BB画像" className="w-full h-full object-contain" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* メタデータ */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="text-sm text-gray-600 mb-1">試料名称</h4>
            <p className="font-medium">外壁 スレート版</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 mb-1">現場名称</h4>
            <Badge variant="secondary">渋谷現場</Badge>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 mb-1">取得場所</h4>
            <p className="text-sm">東京都渋谷区渋谷1-1-1</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 mb-1">判定日時</h4>
            <p className="text-sm">2025/10/25 14:30</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

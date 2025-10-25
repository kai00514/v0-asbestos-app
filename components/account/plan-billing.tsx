"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function PlanBilling() {
  const current = 123
  const limit = 1000
  const percentage = (current / limit) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>プラン・請求</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-emerald-600">スタンダードプラン</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              アクティブ
            </Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">¥29,800/月</p>
          <p className="text-sm text-gray-600">契約期間: 2025/01/01 〜 2026/01/01</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <h3 className="text-sm font-medium">今月の利用状況</h3>
            <span className="text-sm text-gray-600">
              {current}/{limit}回
            </span>
          </div>
          <Progress value={percentage} className="h-2 bg-blue-100" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">次回更新日</span>
            <span className="font-medium">2025/11/01</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">次回請求額</span>
            <span className="font-medium">¥29,800</span>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/pricing">プラン変更</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/billing">請求管理</Link>
            </Button>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">支払い方法</span>
              <span className="font-medium">Visa •••• 4242</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">有効期限</span>
              <span className="font-medium">12/2026</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

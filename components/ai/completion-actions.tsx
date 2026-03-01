"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Eye, Camera, List, Building2 } from "lucide-react"

export function CompletionActions({ detectionId }: { detectionId: string }) {

  return (
    <div className="space-y-6">
      {/* メインアクション */}
      <div className="space-y-3">
        <Button asChild className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">
          <Link href={`/detection/${detectionId}`}>
            <Eye className="w-5 h-5 mr-2" />
            詳細を見る
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full h-11 border-emerald-600 text-emerald-700 hover:bg-emerald-50">
          <Link href="/ai">
            <RotateCcw className="w-4 h-4 mr-2" />
            再判定
          </Link>
        </Button>
      </div>

      {/* 次のアクション */}
      <Card>
        <CardHeader>
          <CardTitle>次のアクション</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
            <Link href={`/labs?detectionId=${detectionId}`}>
              <Building2 className="w-6 h-6" />
              <span className="text-sm">分析機関へ依頼</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
            <Link href="/ai">
              <Camera className="w-6 h-6" />
              <span className="text-sm">別の判定を開始</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
            <Link href="/detections">
              <List className="w-6 h-6" />
              <span className="text-sm">判定一覧を見る</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

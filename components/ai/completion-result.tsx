"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BoundingBoxOverlay } from "@/components/detection/bounding-box-overlay"

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  class_name: string
}

interface DetectionImage {
  id: string
  original_url: string
  bb_url: string | null
  bounding_boxes: BoundingBox[]
}

interface Detection {
  id: string
  detection_number: number
  sample_name: string
  site_name: string
  detection_date: string
  result: boolean
  confidence: number
  address: string | null
  notes: string | null
  detection_images: DetectionImage[]
}

export function CompletionResult({ detectionId }: { detectionId: string }) {
  const [detection, setDetection] = useState<Detection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBB, setShowBB] = useState(true)

  useEffect(() => {
    async function fetchDetection() {
      try {
        const response = await fetch(`/api/detections/${detectionId}`)
        if (!response.ok) throw new Error('Failed to fetch detection')
        
        const result = await response.json()
        setDetection(result.data)
      } catch (error) {
        console.error('[v0] Failed to fetch detection:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetection()
  }, [detectionId])

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (!detection) {
    return <div className="text-center py-8">判定データが見つかりません</div>
  }

  const confidence = Math.round(detection.confidence)
  const result = detection.result ? "含有あり" : "含有なし"
  const isLowConfidence = confidence < 70
  const firstImage = detection.detection_images[0]

  return (
    <div className="space-y-6">
      {/* 結果バッジ */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">判定完了</h2>
          <Badge 
            variant={detection.result ? "destructive" : "default"}
            className={!detection.result ? "bg-emerald-600" : ""}
          >
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
          <p className="text-sm text-gray-600">
            {isLowConfidence ? "低信頼度" : "高信頼度"}
          </p>

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">判定画像</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="bb-toggle" 
                checked={showBB} 
                onCheckedChange={setShowBB}
              />
              <Label htmlFor="bb-toggle" className="cursor-pointer">
                バウンディングボックス表示
              </Label>
            </div>
          </div>

          {firstImage && (
            <BoundingBoxOverlay
              imageUrl={firstImage.original_url}
              boundingBoxes={firstImage.bounding_boxes || []}
              showBB={showBB}
              originalWidth={4032}
              originalHeight={3024}
            />
          )}
        </CardContent>
      </Card>

      {/* メタデータ */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="text-sm text-gray-600 mb-1">試料名称</h4>
            <p className="font-medium">{detection.sample_name}</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 mb-1">現場名称</h4>
            <Badge variant="secondary">{detection.site_name}</Badge>
          </div>
          {detection.address && (
            <div>
              <h4 className="text-sm text-gray-600 mb-1">取得場所</h4>
              <p className="text-sm">{detection.address}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm text-gray-600 mb-1">判定日時</h4>
            <p className="text-sm">
              {new Date(detection.detection_date).toLocaleString('ja-JP')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

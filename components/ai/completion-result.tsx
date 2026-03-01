"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Detection {
  id: string
  sample_name: string
  site_name: string
  address: string | null
  result: boolean
  confidence: number
  detection_date: string
  detection_images: Array<{
    original_url: string
    bb_url: string | null
    thumbnail_url: string | null
  }>
}

export function CompletionResult({ detectionId }: { detectionId: string }) {
  const [detection, setDetection] = useState<Detection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDetection() {
      try {
        const supabase = getSupabaseBrowserClient()

        // 認証状態を確認
        const { data: { user } } = await supabase.auth.getUser()
        console.log("[v0] Current user:", user?.id)
        console.log("[v0] User metadata:", user?.user_metadata)
        console.log("[v0] Company ID from metadata:", user?.user_metadata?.company_id)
        console.log("[v0] Fetching detection:", detectionId)

        // まず、レコードが存在するか確認（.single()を使わない）
        const { data: allData, error: queryError, count } = await supabase
          .from("detections")
          .select(`
            id,
            sample_name,
            site_name,
            address,
            result,
            confidence,
            detection_date,
            detection_images(
              id,
              original_url,
              bb_url,
              thumbnail_url,
              filename,
              order_index
            )
          `, { count: "exact" })
          .eq("id", detectionId)

        console.log("[v0] Query result:", { data: allData, count, error: queryError })

        if (queryError) {
          console.error("[v0] Query error:", {
            message: queryError.message,
            code: queryError.code,
            details: queryError.details,
            hint: queryError.hint,
            full: JSON.stringify(queryError, null, 2)
          })
          throw new Error(`Supabase query failed: ${queryError.message || 'Unknown error'}`)
        }

        if (!allData || allData.length === 0) {
          throw new Error(`判定データが見つかりませんでした (ID: ${detectionId})`)
        }

        if (allData.length > 1) {
          console.warn("[v0] Multiple records found:", allData.length)
        }

        const data = allData[0]

        console.log("[v0] Detection data:", data)
        setDetection(data)
      } catch (err) {
        console.error("[v0] Error fetching detection:", err)
        setError(err instanceof Error ? err.message : "判定結果の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchDetection()
  }, [detectionId])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !detection) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "判定結果が見つかりませんでした"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const confidence = Math.round(detection.confidence * 100)
  const result = detection.result ? "含有あり" : "含有なし"
  const isLowConfidence = confidence < 70
  const firstImage = detection.detection_images[0]

  return (
    <div className="space-y-6">
      {/* 結果バッジ */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                detection.result ? "bg-red-100" : "bg-emerald-100"
              }`}
            >
              {detection.result ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">判定完了</h2>
              <Badge variant={detection.result ? "destructive" : "default"} className="text-sm px-3 py-0.5 mt-1">
                {result}
              </Badge>
            </div>
          </div>
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
                {firstImage?.original_url ? (
                  <img src={firstImage.original_url} alt="元画像" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">画像がありません</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="bb">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={firstImage?.bb_url || "/no-result.svg"}
                  alt={firstImage?.bb_url ? "BB画像" : "No Result"}
                  className="w-full h-full object-contain"
                />
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
            <p className="text-sm">{new Date(detection.detection_date).toLocaleString("ja-JP")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

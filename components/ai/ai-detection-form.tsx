"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/ai/image-upload"
import { AccuracyTips } from "@/components/ai/accuracy-tips"
import { ModelInfo } from "@/components/ai/model-info"
import { Camera, MapPin, Loader2, Navigation, FileText, MapPinned, ClipboardList } from "lucide-react"
import { toast } from "sonner"

export function AIDetectionForm() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [sampleName, setSampleName] = useState("")
  const [siteName, setSiteName] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" })

  const getCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("このブラウザでは位置情報がサポートされていません")
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLocation(`${lat}, ${lng}`)
        setGettingLocation(false)
        toast.success(`現在地を取得しました (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      },
      (error) => {
        setGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("位置情報の使用が許可されていません。ブラウザの設定を確認してください。")
            break
          case error.POSITION_UNAVAILABLE:
            toast.error("位置情報を取得できませんでした")
            break
          case error.TIMEOUT:
            toast.error("位置情報の取得がタイムアウトしました")
            break
          default:
            toast.error("位置情報の取得に失敗しました")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length === 0) {
      toast.error("画像を追加してください")
      return
    }

    setLoading(true)
    setProgress({ current: 0, total: images.length, stage: "画像を変換中" })

    try {
      const imagePromises = images.map((file) => {
        return new Promise<{ data: string; filename: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve({ data: reader.result as string, filename: file.name })
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const base64Images = await Promise.all(imagePromises)
      console.log("[v0] Converted", base64Images.length, "images to base64")

      setProgress({ current: 0, total: images.length, stage: "AI解析中" })

      const response = await fetch("/api/detections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_name: sampleName,
          site_name: siteName,
          address: location || undefined,
          notes: notes || undefined,
          location: location && location.includes(",")
            ? {
                latitude: Number.parseFloat(location.split(",")[0].trim()),
                longitude: Number.parseFloat(location.split(",")[1].trim()),
              }
            : undefined,
          images: base64Images,
        }),
      })

      console.log("[v0] API response status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text.substring(0, 200))
        throw new Error("サーバーエラーが発生しました。管理者にお問い合わせください。")
      }

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] API error response:", result)
        throw new Error(result.error || "AI判定に失敗しました")
      }

      console.log("[v0] AI detection completed:", result.data.id)

      toast.success("AI判定が完了しました")

      router.push(`/ai/complete?id=${result.data.id}`)
    } catch (error) {
      console.error("[v0] AI detection error:", error)
      toast.error(error instanceof Error ? error.message : "AI判定に失敗しました")
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0, stage: "" })
    }
  }

  const canSubmit = images.length > 0 && sampleName && siteName && !loading

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ステップ1: 画像選択 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">1</div>
          <h2 className="text-sm font-semibold text-gray-700">検査画像のアップロード</h2>
        </div>
        <ImageUpload images={images} onImagesChange={setImages} />
      </div>

      {/* ステップ2: 判定情報 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">2</div>
          <h2 className="text-sm font-semibold text-gray-700">判定情報の入力</h2>
        </div>
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sample-name" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                試料名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sample-name"
                placeholder="例: 外壁 スレート版"
                value={sampleName}
                onChange={(e) => setSampleName(e.target.value)}
                required
                className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="site-name" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPinned className="w-3.5 h-3.5 text-gray-400" />
                現場名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="site-name"
                placeholder="例: 渋谷現場"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                取得場所
              </Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="住所または座標を入力"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="h-11 px-3 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all rounded-lg"
                  title="現在地を取得"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">位置情報アイコンをタップすると現在地のGPS座標を自動取得します</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                備考
              </Label>
              <Textarea
                id="notes"
                placeholder="特記事項があれば入力してください"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[80px] resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ステップ3: 補足情報 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">i</div>
          <h2 className="text-sm font-semibold text-gray-500">補足情報</h2>
        </div>
        <ModelInfo />
        <AccuracyTips />
      </div>

      {/* 解析中プログレス */}
      {loading && (
        <Alert className="bg-emerald-50 border-emerald-200 rounded-xl">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <AlertDescription className="text-emerald-800">
            <div className="space-y-1">
              <p className="font-medium">AI解析中...</p>
              <p className="text-sm">{progress.stage}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 送信ボタン */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-14 text-lg font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 rounded-xl shadow-lg shadow-emerald-200 transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            AI判定中...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-2" />
            AI判定を開始
          </>
        )}
      </Button>
    </form>
  )
}

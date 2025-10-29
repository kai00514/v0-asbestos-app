"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/ai/image-upload"
import { AccuracyTips } from "@/components/ai/accuracy-tips"
import { ModelInfo } from "@/components/ai/model-info"
import { Camera, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AIDetectionForm() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [sampleName, setSampleName] = useState("")
  const [siteName, setSiteName] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" })

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
          toast.success("現在地を取得しました")
        },
        (error) => {
          toast.error("位置情報の取得に失敗しました")
        },
      )
    }
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
          location: location
            ? {
                latitude: Number.parseFloat(location.split(",")[0]),
                longitude: Number.parseFloat(location.split(",")[1]),
              }
            : undefined,
          images: base64Images,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "AI判定に失敗しました")
      }

      const result = await response.json()
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUpload images={images} onImagesChange={setImages} />

      <Card>
        <CardHeader>
          <CardTitle>判定情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sample-name">
              試料名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sample-name"
              placeholder="例: 外壁 スレート版"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-name">
              現場名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="site-name"
              placeholder="例: 渋谷現場"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">取得場所</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="住所を入力"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11"
              />
              <Button type="button" variant="outline" onClick={getCurrentLocation} className="h-11 px-3 bg-transparent">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModelInfo />

      <AccuracyTips />

      {loading && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1">
              <p className="font-medium">AI解析中...</p>
              <p className="text-sm">{progress.stage}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-14 text-lg font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300"
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

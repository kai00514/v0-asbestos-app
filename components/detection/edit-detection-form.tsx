"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, MapPin } from "lucide-react"
import { toast } from "sonner"

export function EditDetectionForm({ detectionId }: { detectionId: string }) {
  const router = useRouter()
  const [sampleName, setSampleName] = useState("外壁 スレート版")
  const [siteName, setSiteName] = useState("渋谷現場")
  const [result, setResult] = useState("detected")
  const [detectionDate, setDetectionDate] = useState("2025-10-22T19:01")
  const [address, setAddress] = useState("東京都渋谷区渋谷1-1-1")
  const [notes, setNotes] = useState("外壁の劣化が見られるため、早急な対応が必要です。")
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 保存処理（実装例）
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("変更を保存しました")
      router.push(`/detection/${detectionId}`)
    } catch (error) {
      toast.error("保存に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddress("東京都渋谷区渋谷1-1-1")
          setHasChanges(true)
          toast.success("現在地を取得しました")
        },
        (error) => {
          toast.error("位置情報の取得に失敗しました")
        },
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">画像の変更はできません</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>画像プレビュー（読み取り専用）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`/asbestos-detection-original-${i === 1 ? "" : i}.jpg`}
                  alt={`画像 ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              value={sampleName}
              onChange={(e) => {
                setSampleName(e.target.value)
                setHasChanges(true)
              }}
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
              value={siteName}
              onChange={(e) => {
                setSiteName(e.target.value)
                setHasChanges(true)
              }}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-3">
            <Label>
              判定結果 <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={result}
              onValueChange={(value) => {
                setResult(value)
                setHasChanges(true)
              }}
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-red-50 transition-colors">
                <RadioGroupItem value="detected" id="detected" />
                <Label htmlFor="detected" className="flex-1 cursor-pointer">
                  含有あり
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-green-50 transition-colors">
                <RadioGroupItem value="not-detected" id="not-detected" />
                <Label htmlFor="not-detected" className="flex-1 cursor-pointer">
                  含有なし
                </Label>
              </div>
            </RadioGroup>
            {result !== "detected" && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">AI判定結果を上書きしますか？</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="detection-date">
              判定日時 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="detection-date"
              type="datetime-local"
              value={detectionDate}
              onChange={(e) => {
                setDetectionDate(e.target.value)
                setHasChanges(true)
              }}
              max={new Date().toISOString().slice(0, 16)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setHasChanges(true)
                }}
                className="h-11"
              />
              <Button type="button" variant="outline" onClick={getCurrentLocation} className="h-11 px-3 bg-transparent">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setHasChanges(true)
              }}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">{notes.length}/500</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 sticky bottom-20 md:bottom-6 bg-gray-50 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 h-12 bg-transparent"
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={!hasChanges || loading}
          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface DetectionImage {
  id: string
  original_url: string
  bb_url: string | null
  thumbnail_url: string | null
  filename: string
  order_index: number
}

export function ImageGallery({ detectionId }: { detectionId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBB, setShowBB] = useState(true)
  const [images, setImages] = useState<DetectionImage[]>([])
  const [loading, setLoading] = useState(true)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    async function fetchImages() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("detection_images")
          .select("*")
          .eq("detection_id", detectionId)
          .order("order_index", { ascending: true })

        if (error) {
          console.error("[v0] ImageGallery - Error fetching images:", error)
          return
        }

        setImages(data || [])
      } catch (err) {
        console.error("[v0] ImageGallery - Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [detectionId])

  if (loading) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">画像がありません</p>
      </div>
    )
  }

  const currentImage = images[currentIndex]
  const hasBB = !!currentImage.bb_url
  const displayUrl = showBB && hasBB ? currentImage.bb_url! : currentImage.original_url

  return (
    <div className="space-y-3">
      <div
        className={`relative bg-gray-900 rounded-xl overflow-hidden transition-all ${
          zoomed ? "aspect-auto max-h-[80vh]" : "aspect-video"
        }`}
      >
        <img
          src={displayUrl}
          alt={`判定画像 ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          style={{ imageOrientation: "from-image" }}
        />

        {/* 画像カウンター */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white">
          {currentIndex + 1} / {images.length}
        </div>

        {/* BB表示のインジケーター */}
        {showBB && hasBB && (
          <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            AI検出表示中
          </div>
        )}

        {/* コントロールバー */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={() => setZoomed(!zoomed)}
          >
            {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
            asChild
          >
            <a href={displayUrl} download={currentImage.filename} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* BB切り替えトグル */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3">
          <Switch
            id="bb-toggle"
            checked={showBB}
            onCheckedChange={setShowBB}
            disabled={!hasBB}
          />
          <Label htmlFor="bb-toggle" className={`text-sm font-medium ${!hasBB ? "text-gray-400" : "text-gray-700"}`}>
            バウンディングボックス表示
            {!hasBB && <span className="text-xs ml-1 text-gray-400">(BB画像なし)</span>}
          </Label>
        </div>
        {hasBB && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${showBB ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
            {showBB ? "ON" : "OFF"}
          </span>
        )}
      </div>

      {/* サムネイル一覧 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? "border-emerald-500 shadow-md shadow-emerald-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={image.thumbnail_url || image.original_url}
                alt={`サムネイル ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

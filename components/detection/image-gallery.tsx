"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
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
  const [showBB, setShowBB] = useState(false)
  const [images, setImages] = useState<DetectionImage[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">画像がありません</p>
      </div>
    )
  }

  const currentImage = images[currentIndex]
  const hasBB = !!currentImage.bb_url
  const displayUrl = showBB && hasBB ? currentImage.bb_url! : currentImage.original_url

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={displayUrl}
          alt={`判定画像 ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <Button variant="secondary" size="icon" className="absolute bottom-4 right-4" asChild>
          <a href={displayUrl} download={currentImage.filename} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="bb-toggle"
            checked={showBB}
            onCheckedChange={setShowBB}
            disabled={!hasBB}
          />
          <Label htmlFor="bb-toggle" className={!hasBB ? "text-gray-400" : ""}>
            バウンディングボックス表示
            {!hasBB && <span className="text-xs ml-1">(BB画像なし)</span>}
          </Label>
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                currentIndex === index ? "border-emerald-600" : "border-gray-200"
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

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface BoundingBox {
  id: string
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
  thumbnail_url: string | null
  filename: string | null
  order_index: number
  width: number | null
  height: number | null
  bounding_boxes: BoundingBox[]
}

function getBBColor(confidence: number): string {
  if (confidence >= 0.8) return "#ef4444"
  if (confidence >= 0.6) return "#f59e0b"
  return "#eab308"
}

export function ImageGallery({ detectionId }: { detectionId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [images, setImages] = useState<DetectionImage[]>([])
  const [loading, setLoading] = useState(true)
  const [zoomed, setZoomed] = useState(false)
  const [bbVisibility, setBbVisibility] = useState<Record<string, boolean>>({})
  const [showAllBB, setShowAllBB] = useState(true)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("detection_images")
          .select("*, bounding_boxes(*)")
          .eq("detection_id", detectionId)
          .order("order_index", { ascending: true })

        if (error) {
          console.error("ImageGallery - Error fetching images:", error)
          return
        }

        const imgs = (data || []) as DetectionImage[]
        setImages(imgs)

        // 全BBをデフォルトで表示
        const visibility: Record<string, boolean> = {}
        imgs.forEach((img) => {
          img.bounding_boxes?.forEach((bb) => {
            visibility[bb.id] = true
          })
        })
        setBbVisibility(visibility)
      } catch (err) {
        console.error("ImageGallery - Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [detectionId])

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }, [])

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
  const currentBBs = currentImage.bounding_boxes || []
  const hasBBs = currentBBs.length > 0

  // 画像寸法: DBから or naturalWidth/Height
  const imgWidth = currentImage.width || imageDimensions?.width || 0
  const imgHeight = currentImage.height || imageDimensions?.height || 0

  const visibleBBs = currentBBs.filter((bb) => bbVisibility[bb.id])

  const handleToggleAll = (checked: boolean) => {
    setShowAllBB(checked)
    const newVisibility = { ...bbVisibility }
    currentBBs.forEach((bb) => {
      newVisibility[bb.id] = checked
    })
    setBbVisibility(newVisibility)
  }

  const handleToggleSingle = (bbId: string, checked: boolean) => {
    const newVisibility = { ...bbVisibility, [bbId]: checked }
    setBbVisibility(newVisibility)
    // showAllBBの状態を同期
    const allCurrentVisible = currentBBs.every((bb) => newVisibility[bb.id])
    setShowAllBB(allCurrentVisible)
  }

  return (
    <div className="space-y-3">
      {/* 画像表示エリア */}
      <div
        className={`relative bg-gray-900 rounded-xl overflow-hidden transition-all ${
          zoomed ? "aspect-auto max-h-[80vh]" : "aspect-video"
        }`}
      >
        <div className="relative w-full h-full">
          <img
            ref={imgRef}
            src={currentImage.original_url}
            alt={`判定画像 ${currentIndex + 1}`}
            className="w-full h-full object-contain"
            style={{ imageOrientation: "from-image" }}
            onLoad={handleImageLoad}
          />

          {/* SVG BBオーバーレイ */}
          {hasBBs && imgWidth > 0 && imgHeight > 0 && visibleBBs.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${imgWidth} ${imgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {visibleBBs.map((bb) => {
                const left = bb.x - bb.width / 2
                const top = bb.y - bb.height / 2
                const color = getBBColor(bb.confidence)
                const label = `${bb.class_name} ${(bb.confidence * 100).toFixed(1)}%`
                const labelWidth = label.length * 10 + 12
                const labelHeight = 28

                return (
                  <g key={bb.id}>
                    <rect
                      x={left}
                      y={top}
                      width={bb.width}
                      height={bb.height}
                      fill="none"
                      stroke={color}
                      strokeWidth="4"
                      strokeOpacity="0.9"
                    />
                    <rect
                      x={left}
                      y={top - labelHeight - 2}
                      width={labelWidth}
                      height={labelHeight}
                      fill={color}
                      fillOpacity="0.85"
                      rx="4"
                    />
                    <text
                      x={left + 6}
                      y={top - 8}
                      fontFamily="Arial, sans-serif"
                      fontSize="16"
                      fontWeight="bold"
                      fill="white"
                    >
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* 画像カウンター */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white">
          {currentIndex + 1} / {images.length}
        </div>

        {/* BB表示のインジケーター */}
        {hasBBs && visibleBBs.length > 0 && (
          <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            BB表示中 ({visibleBBs.length}/{currentBBs.length})
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
            <a href={currentImage.original_url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* BB切り替えコントロール */}
      {hasBBs && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 全体スイッチ */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Switch
                id="bb-toggle-all"
                checked={showAllBB}
                onCheckedChange={handleToggleAll}
              />
              <Label htmlFor="bb-toggle-all" className="text-sm font-medium text-gray-700">
                全てのBB表示
              </Label>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${showAllBB ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
              {visibleBBs.length}/{currentBBs.length}
            </span>
          </div>

          {/* 個別BBチェックボックス */}
          <div className="px-4 py-2 space-y-1 max-h-48 overflow-y-auto">
            {currentBBs.map((bb, idx) => {
              const color = getBBColor(bb.confidence)
              return (
                <label
                  key={bb.id}
                  className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"
                >
                  <Checkbox
                    checked={bbVisibility[bb.id] ?? true}
                    onCheckedChange={(checked) => handleToggleSingle(bb.id, !!checked)}
                  />
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {bb.class_name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {(bb.confidence * 100).toFixed(1)}%
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* BB非検出の場合 */}
      {!hasBBs && (
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <Switch id="bb-toggle" checked={false} disabled />
            <Label htmlFor="bb-toggle" className="text-sm font-medium text-gray-400">
              バウンディングボックス表示
              <span className="text-xs ml-1">(検出なし)</span>
            </Label>
          </div>
        </div>
      )}

      {/* サムネイル一覧 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentIndex(index)
                setImageDimensions(null)
              }}
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

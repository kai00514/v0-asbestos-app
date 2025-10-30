"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BoundingBoxOverlay } from "./bounding-box-overlay"

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
  bounding_boxes: BoundingBox[]
}

interface Props {
  images: DetectionImage[]
}

export function ImageGallery({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBB, setShowBB] = useState(false)

  if (!images || images.length === 0) {
    return <div className="text-center text-gray-500">画像がありません</div>
  }

  const currentImage = images[currentIndex]

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <BoundingBoxOverlay
          imageUrl={currentImage.original_url}
          boundingBoxes={currentImage.bounding_boxes || []}
          showBB={showBB}
          originalWidth={4032}
          originalHeight={3024}
        />
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute bottom-4 right-4"
          onClick={() => window.open(currentImage.original_url, '_blank')}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="bb-toggle" checked={showBB} onCheckedChange={setShowBB} />
          <Label htmlFor="bb-toggle">バウンディングボックス表示</Label>
        </div>
      </div>

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
              src={image.original_url}
              alt={`サムネイル ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

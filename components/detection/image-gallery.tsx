"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const images = ["/asbestos-detection-original.jpg", "/asbestos-detection-original-2.jpg", "/asbestos-detection-original-3.jpg"]

export function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBB, setShowBB] = useState(false)

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`判定画像 ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <Button variant="secondary" size="icon" className="absolute bottom-4 right-4">
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
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              currentIndex === index ? "border-emerald-600" : "border-gray-200"
            }`}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`サムネイル ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

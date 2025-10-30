"use client"

import { useEffect, useRef } from "react"

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  class_name: string
}

interface Props {
  imageUrl: string
  boundingBoxes: BoundingBox[]
  showBB: boolean
  originalWidth: number
  originalHeight: number
}

export function BoundingBoxOverlay({ imageUrl, boundingBoxes, showBB, originalWidth, originalHeight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current

    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // BB非表示時はクリア
    if (!showBB) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    // 画像の表示サイズを取得
    const displayWidth = img.clientWidth
    const displayHeight = img.clientHeight

    // Canvasサイズを設定
    canvas.width = displayWidth
    canvas.height = displayHeight

    // スケール計算
    const scaleX = displayWidth / originalWidth
    const scaleY = displayHeight / originalHeight

    // クリア
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // 各BBを描画
    boundingBoxes.forEach((bb) => {
      // Roboflowは中心座標なので左上に変換
      const centerX = bb.x * scaleX
      const centerY = bb.y * scaleY
      const width = bb.width * scaleX
      const height = bb.height * scaleY
      const x = centerX - width / 2
      const y = centerY - height / 2

      // 矩形
      ctx.strokeStyle = "#FF0000"
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, width, height)

      // ラベル
      const label = `${bb.class_name} ${(bb.confidence * 100).toFixed(0)}%`
      ctx.font = "bold 14px Arial"
      const textMetrics = ctx.measureText(label)

      // ラベル背景
      ctx.fillStyle = "#FF0000"
      ctx.fillRect(x, y - 22, textMetrics.width + 10, 22)

      // ラベルテキスト
      ctx.fillStyle = "#FFFFFF"
      ctx.fillText(label, x + 5, y - 5)
    })
  }, [showBB, boundingBoxes, originalWidth, originalHeight, imageUrl])

  // リサイズ対応
  useEffect(() => {
    const handleResize = () => {
      // 再描画をトリガー
      if (imgRef.current) {
        imgRef.current.dispatchEvent(new Event("load"))
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative inline-block w-full">
      <img
        ref={imgRef}
        src={imageUrl || "/placeholder.svg"}
        alt="Detection"
        className="w-full h-auto"
        onLoad={() => {
          // 画像読み込み完了時にBBを再描画
          if (canvasRef.current && showBB) {
            const event = new Event("resize")
            window.dispatchEvent(event)
          }
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

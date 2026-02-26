import sharp from "sharp"

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  class: string
}

/**
 * XMLの特殊文字をエスケープする
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * バウンディングボックスを画像に描画する
 * @param imageBuffer 元画像のBuffer
 * @param boundingBoxes BB座標の配列
 * @returns BB描画済み画像のBuffer
 */
export async function drawBoundingBoxes(imageBuffer: Buffer, boundingBoxes: BoundingBox[]): Promise<Buffer> {
  try {
    console.log(`[v0] drawBoundingBoxes: Processing ${boundingBoxes.length} bounding boxes`)

    // rotate()を呼ぶことでEXIF orientationを適用し、元画像と同じ向きにする
    const image = sharp(imageBuffer).rotate()
    const metadata = await sharp(imageBuffer).rotate().metadata()
    const imageWidth = metadata.width!
    const imageHeight = metadata.height!

    console.log(`[v0] Image dimensions (after rotation): ${imageWidth}x${imageHeight}`)

    if (boundingBoxes.length === 0) {
      console.log(`[v0] No bounding boxes to draw, returning rotated image`)
      return image.toBuffer()
    }

    // SVGでバウンディングボックスを描画
    const svgOverlay = generateBoundingBoxSVG(boundingBoxes, imageWidth, imageHeight)

    console.log(`[v0] Generated SVG overlay`)

    // EXIF回転適用済み画像にSVGを重ねる
    const processedImage = await image
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer()

    console.log(`[v0] Successfully drew bounding boxes`)
    return processedImage
  } catch (error) {
    console.error(`[v0] Error drawing bounding boxes:`, error)
    throw error
  }
}

/**
 * BB描画の色を信頼度に応じて決定
 */
function getBoxColor(confidence: number): { stroke: string; fill: string; glow: string } {
  if (confidence >= 0.8) {
    return { stroke: "#ef4444", fill: "#dc2626", glow: "rgba(239,68,68,0.3)" }
  } else if (confidence >= 0.6) {
    return { stroke: "#f59e0b", fill: "#d97706", glow: "rgba(245,158,11,0.3)" }
  }
  return { stroke: "#eab308", fill: "#ca8a04", glow: "rgba(234,179,8,0.3)" }
}

/**
 * SVG形式でバウンディングボックスを生成（リッチプレビュー版）
 */
function generateBoundingBoxSVG(boundingBoxes: BoundingBox[], imageWidth: number, imageHeight: number): string {
  // ストローク幅は画像サイズに応じて調整
  const baseStrokeWidth = Math.max(3, Math.round(Math.min(imageWidth, imageHeight) / 200))
  const fontSize = Math.max(14, Math.round(Math.min(imageWidth, imageHeight) / 60))
  const labelPadding = Math.round(fontSize * 0.4)
  const labelHeight = fontSize + labelPadding * 2

  const defs = `
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.5"/>
      </filter>
    </defs>
  `

  const boxes = boundingBoxes
    .map((bb, index) => {
      // BBの座標は中心点(x, y)とwidth, heightで表現されている
      const left = bb.x - bb.width / 2
      const top = bb.y - bb.height / 2
      const width = bb.width
      const height = bb.height
      const colors = getBoxColor(bb.confidence)

      // ラベルテキスト（日本語対応のためエスケープ）
      const label = escapeXml(`${bb.class} ${(bb.confidence * 100).toFixed(1)}%`)
      const labelWidth = label.length * fontSize * 0.6 + labelPadding * 2

      // ラベルの位置（上に配置、画像外にはみ出す場合は下に配置）
      const labelY = top - labelHeight - 4 >= 0 ? top - labelHeight - 4 : top + height + 4
      const labelTextY = labelY + labelHeight - labelPadding

      return `
        <rect x="${left}" y="${top}" width="${width}" height="${height}"
          fill="${colors.glow}" fill-opacity="0.15" rx="2" ry="2"/>
        <rect x="${left}" y="${top}" width="${width}" height="${height}"
          fill="none" stroke="${colors.stroke}" stroke-width="${baseStrokeWidth}"
          stroke-opacity="0.95" rx="2" ry="2" filter="url(#glow)"/>
        <rect x="${left}" y="${top}" width="${width}" height="${height}"
          fill="none" stroke="white" stroke-width="${Math.max(1, baseStrokeWidth - 2)}"
          stroke-opacity="0.3" rx="2" ry="2"/>
        <rect x="${left}" y="${labelY}" width="${labelWidth}" height="${labelHeight}"
          fill="${colors.fill}" fill-opacity="0.9" rx="4" ry="4" filter="url(#shadow)"/>
        <text x="${left + labelPadding}" y="${labelTextY}"
          font-family="'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Arial, sans-serif"
          font-size="${fontSize}" font-weight="bold" fill="white"
          text-rendering="optimizeLegibility">${label}</text>
      `
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">${defs}${boxes}</svg>`
}

/**
 * サムネイル画像を生成する
 * @param imageBuffer 元画像のBuffer
 * @param size サムネイルのサイズ（デフォルト: 300x300）
 * @returns サムネイル画像のBuffer
 */
export async function generateThumbnail(imageBuffer: Buffer, size: number = 300): Promise<Buffer> {
  try {
    console.log(`[v0] generateThumbnail: Generating ${size}x${size} thumbnail`)

    const thumbnail = await sharp(imageBuffer)
      .rotate()
      .resize(size, size, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer()

    console.log(`[v0] Successfully generated thumbnail`)
    return thumbnail
  } catch (error) {
    console.error(`[v0] Error generating thumbnail:`, error)
    throw error
  }
}

/**
 * 画像を最適化する（サイズ制限、圧縮）
 * @param imageBuffer 元画像のBuffer
 * @param maxWidth 最大幅（デフォルト: 2000）
 * @param maxHeight 最大高さ（デフォルト: 2000）
 * @returns 最適化された画像のBuffer
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  maxWidth: number = 2000,
  maxHeight: number = 2000,
): Promise<Buffer> {
  try {
    console.log(`[v0] optimizeImage: Optimizing image (max: ${maxWidth}x${maxHeight})`)

    const metadata = await sharp(imageBuffer).metadata()
    const needsResize = (metadata.width || 0) > maxWidth || (metadata.height || 0) > maxHeight

    let image = sharp(imageBuffer).rotate()

    if (needsResize) {
      console.log(`[v0] Image needs resizing from ${metadata.width}x${metadata.height}`)
      image = image.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
    }

    const optimized = await image
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer()

    console.log(
      `[v0] Successfully optimized image (${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB → ${(optimized.length / 1024 / 1024).toFixed(2)}MB)`,
    )
    return optimized
  } catch (error) {
    console.error(`[v0] Error optimizing image:`, error)
    throw error
  }
}

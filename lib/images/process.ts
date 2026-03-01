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
 * バウンディングボックスを画像に描画する
 * @param imageBuffer 元画像のBuffer
 * @param boundingBoxes BB座標の配列
 * @returns BB描画済み画像のBuffer
 */
export async function drawBoundingBoxes(imageBuffer: Buffer, boundingBoxes: BoundingBox[]): Promise<Buffer> {
  try {
    console.log(`[v0] drawBoundingBoxes: Processing ${boundingBoxes.length} bounding boxes`)

    // EXIF回転を適用してからメタデータを取得
    // ブラウザCanvas（クライアント側圧縮）やRoboflow APIはEXIF回転済みの画像を扱うため、
    // Sharp側でも.rotate()で自動回転させて座標系を一致させる
    const image = sharp(imageBuffer).rotate()
    const metadata = await image.metadata()
    const imageWidth = metadata.width!
    const imageHeight = metadata.height!

    console.log(`[v0] Image dimensions: ${imageWidth}x${imageHeight}`)

    if (boundingBoxes.length === 0) {
      console.log(`[v0] No bounding boxes to draw, returning rotated image`)
      return await image.toBuffer()
    }

    // SVGでバウンディングボックスを描画
    const svgOverlay = generateBoundingBoxSVG(boundingBoxes, imageWidth, imageHeight)

    console.log(`[v0] Generated SVG overlay`)

    // 元画像にSVGを重ねる
    const processedImage = await image
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .toBuffer()

    console.log(`[v0] Successfully drew bounding boxes`)
    return processedImage
  } catch (error) {
    console.error(`[v0] Error drawing bounding boxes:`, error)
    throw error
  }
}

/**
 * SVG形式でバウンディングボックスを生成
 */
function generateBoundingBoxSVG(boundingBoxes: BoundingBox[], imageWidth: number, imageHeight: number): string {
  const boxes = boundingBoxes
    .map((bb, index) => {
      // BBの座標は中心点(x, y)とwidth, heightで表現されている
      const left = bb.x - bb.width / 2
      const top = bb.y - bb.height / 2
      const width = bb.width
      const height = bb.height

      // 信頼度に応じて色を変更
      const color = bb.confidence >= 0.8 ? "#ef4444" : bb.confidence >= 0.6 ? "#f59e0b" : "#eab308"

      // ラベルテキスト
      const label = `${bb.class} ${(bb.confidence * 100).toFixed(1)}%`

      return `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="none" stroke="${color}" stroke-width="4" stroke-opacity="0.9"/><rect x="${left}" y="${top - 30}" width="${label.length * 8 + 10}" height="25" fill="${color}" fill-opacity="0.8"/><text x="${left + 5}" y="${top - 10}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">${label}</text>`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">${boxes}</svg>`
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

    const rotated = sharp(imageBuffer).rotate()
    const metadata = await rotated.metadata()
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

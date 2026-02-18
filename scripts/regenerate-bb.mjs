/**
 * 既存のdetection_imagesレコードのbb_urlを再生成するスクリプト
 * 使い方: node scripts/regenerate-bb.mjs
 */

import sharp from 'sharp'
import https from 'https'

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY || 'wqIalPUEPICBR6TjbU35'
const ROBOFLOW_WORKFLOW_URL = process.env.ROBOFLOW_WORKFLOW_URL || 'https://serverless.roboflow.com/asbestos-aokhx/workflows/detect-count-and-visualize'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://erppwxvwrkljhkymdvvv.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycHB3eHZ3cmtsamhreW1kdnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM4MzI4NiwiZXhwIjoyMDc2OTU5Mjg2fQ.bWfuf8llZlCEauZ6GyJ1Tr96rgOPO87-sOltD2UApvQ'

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { headers, ...options })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text}`)
  return JSON.parse(text)
}

async function uploadToStorage(buffer, filePath, contentType) {
  return new Promise((resolve, reject) => {
    const hostname = new URL(SUPABASE_URL).hostname
    const options = {
      hostname, port: 443,
      path: `/storage/v1/object/detection-images/${filePath}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'x-upsert': 'true',
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(`${SUPABASE_URL}/storage/v1/object/public/detection-images/${filePath}`)
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`))
        }
      })
    })
    req.on('error', reject)
    req.write(buffer)
    req.end()
  })
}

function generateBBSVG(bbs, w, h) {
  const boxes = bbs.map((bb, i) => {
    const left = bb.x - bb.width / 2
    const top = bb.y - bb.height / 2
    const color = bb.confidence >= 0.8 ? '#ef4444' : bb.confidence >= 0.6 ? '#f59e0b' : '#eab308'
    const label = `${bb.class} ${(bb.confidence * 100).toFixed(1)}%`
    return `
      <rect x="${left}" y="${top}" width="${bb.width}" height="${bb.height}"
        fill="none" stroke="${color}" stroke-width="8" stroke-opacity="0.9"/>
      <rect x="${left}" y="${top - 50}" width="${label.length * 14 + 16}" height="44"
        fill="${color}" fill-opacity="0.85"/>
      <text x="${left + 8}" y="${top - 18}" font-family="Arial" font-size="28"
        font-weight="bold" fill="white">${label}</text>`
  }).join('\n')
  return `<svg width="${w}" height="${h}">${boxes}</svg>`
}

async function main() {
  console.log('=== BB再生成スクリプト開始 ===\n')

  // bb_url が null のレコードを取得
  const images = await fetchJson(
    `${SUPABASE_URL}/rest/v1/detection_images?select=id,original_url,bb_url,filename&bb_url=is.null&limit=50`
  )

  console.log(`bb_url が null のレコード数: ${images.length}`)

  let success = 0, failed = 0

  for (const img of images) {
    console.log(`\n--- 処理中: ${img.id} (${img.filename}) ---`)
    try {
      // 1. 元画像をダウンロード
      const imgRes = await fetch(img.original_url)
      if (!imgRes.ok) throw new Error(`画像取得失敗: ${imgRes.status}`)
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
      const meta = await sharp(imgBuffer).metadata()
      console.log(`  画像サイズ: ${meta.width}x${meta.height}`)

      // 2. Roboflow API呼び出し
      const rfRes = await fetch(ROBOFLOW_WORKFLOW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: ROBOFLOW_API_KEY,
          inputs: { image: { type: 'url', value: img.original_url } },
        }),
        signal: AbortSignal.timeout(30000),
      })
      const rfData = await rfRes.json()
      const predictions = rfData.outputs?.[0]?.predictions?.predictions || []
      const count = rfData.outputs?.[0]?.count_objects || 0
      console.log(`  検出数: ${count}`)

      if (count === 0) {
        console.log(`  → 検出なし、スキップ`)
        continue
      }

      // 3. BB描画
      const svg = generateBBSVG(predictions, meta.width, meta.height)
      const bbBuffer = await sharp(imgBuffer)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .jpeg({ quality: 90 })
        .toBuffer()

      // 4. Storageにアップロード
      // original_urlからパスを抽出
      const urlPath = img.original_url.replace(`${SUPABASE_URL}/storage/v1/object/public/detection-images/`, '')
      const dir = urlPath.split('/').slice(0, -1).join('/')
      const bbPath = `${dir}/bb_000_${Date.now()}.jpg`
      const bbUrl = await uploadToStorage(bbBuffer, bbPath, 'image/jpeg')
      console.log(`  BB URL: ${bbUrl}`)

      // 5. DBを更新（PATCHは204 No Contentを返すのでfetchJsonを使わない）
      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/detection_images?id=eq.${img.id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ bb_url: bbUrl }),
        }
      )
      if (!patchRes.ok) {
        const txt = await patchRes.text()
        throw new Error(`DB更新失敗: ${patchRes.status} - ${txt}`)
      }
      console.log(`  → DB更新完了 (${patchRes.status})`)
      success++
    } catch (e) {
      console.error(`  ERROR: ${e.message}`)
      failed++
    }
  }

  console.log(`\n=== 完了: 成功=${success}, 失敗=${failed}, スキップ=${images.length - success - failed} ===`)
}

main().catch(console.error)

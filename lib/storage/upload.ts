import "server-only"
import https from "https"

/**
 * Supabase Storageに画像をアップロードする（Node.js httpsモジュール使用）
 * Next.jsのfetchインターセプションを完全にバイパス
 */
export async function uploadImageToStorage(buffer: Buffer, filePath: string, contentType: string): Promise<string> {
  console.log(`[v0] [uploadImageToStorage] Starting upload via Node.js HTTPS...`)
  console.log(`[v0] [uploadImageToStorage] File path: ${filePath}`)
  console.log(`[v0] [uploadImageToStorage] Content-Type: ${contentType}`)
  console.log(`[v0] [uploadImageToStorage] Buffer size: ${buffer.length} bytes`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // URLをパース
  const uploadPath = `/storage/v1/object/detection-images/${filePath}`
  const hostname = new URL(supabaseUrl).hostname

  console.log(`[v0] [uploadImageToStorage] Hostname: ${hostname}`)
  console.log(`[v0] [uploadImageToStorage] Path: ${uploadPath}`)

  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname,
      port: 443,
      path: uploadPath,
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": contentType,
        "Content-Length": buffer.length,
        "x-upsert": "false",
      },
    }

    const req = https.request(options, (res) => {
      console.log(`[v0] [uploadImageToStorage] Response status: ${res.statusCode}`)

      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        console.log(`[v0] [uploadImageToStorage] Response body:`, data)

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          // 公開URLを生成
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/detection-images/${filePath}`
          console.log(`[v0] [uploadImageToStorage] Upload successful, public URL: ${publicUrl}`)
          resolve(publicUrl)
        } else {
          console.error(`[v0] [uploadImageToStorage] Upload failed with status ${res.statusCode}`)
          reject(new Error(`Upload failed with status ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on("error", (error) => {
      console.error(`[v0] [uploadImageToStorage] Request error:`, error)
      reject(error)
    })

    // データを書き込み
    req.write(buffer)
    req.end()
  })
}

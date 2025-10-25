"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Building2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export function DetectionActions({ id }: { id: string }) {
  const handleDownloadPDF = () => {
    toast.success("PDFを生成中...")
    // PDF生成ロジック
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 space-y-3 max-w-4xl mx-auto">
      <Button
        onClick={handleDownloadPDF}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-base font-medium"
      >
        <Download className="w-5 h-5 mr-2" />
        判定結果報告書をダウンロード
      </Button>

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1 h-11 bg-transparent">
          <Link href={`/labs?detectionId=${id}`}>
            <Building2 className="w-4 h-4 mr-2" />
            分析機関へ依頼
          </Link>
        </Button>
        <Button variant="ghost" className="flex-1 h-11 text-gray-600">
          <AlertCircle className="w-4 h-4 mr-2" />
          誤検出を報告
        </Button>
      </div>
    </div>
  )
}

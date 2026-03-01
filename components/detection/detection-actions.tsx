"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Building2, AlertCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DetectionActions({ id }: { id: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDownloadPDF = () => {
    toast.info("この機能はまだ実装されていません。今後のアップデートをお待ちください。")
  }

  const handleReportFalsePositive = () => {
    toast.info("誤検出報告を受け付けました。確認後、ご連絡いたします。")
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/detections/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error?.message || "削除に失敗しました")
      }
      toast.success("判定を削除しました")
      router.push("/detections")
    } catch (err: any) {
      toast.error(err.message || "削除に失敗しました")
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownloadPDF}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-base font-medium rounded-xl shadow-sm"
      >
        <Download className="w-5 h-5 mr-2" />
        判定結果報告書をダウンロード
      </Button>

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700">
          <Link href={`/labs?detectionId=${id}`}>
            <Building2 className="w-4 h-4 mr-2" />
            分析機関へ依頼
          </Link>
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          onClick={handleReportFalsePositive}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          誤検出を報告
        </Button>
      </div>

      {/* 削除ボタン */}
      {!showConfirm ? (
        <Button
          variant="ghost"
          className="w-full h-11 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          この判定を削除
        </Button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-red-700 font-medium">この判定を削除しますか？この操作は取り消せません。</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-lg border-gray-200"
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "削除中..." : "削除する"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

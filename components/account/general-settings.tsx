"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Trash2 } from "lucide-react"
import { ContactDialog } from "./contact-dialog"
import { FAQDialog } from "./faq-dialog"
import { deleteAccount } from "@/app/actions/account"
import { toast } from "sonner"

export function GeneralSettings() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success("アカウントを削除しました")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "アカウントの削除に失敗しました")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>一般</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">カスタマーサポート</h3>
          <div className="space-y-2">
            <ContactDialog />
            <FAQDialog />
            <p className="text-xs text-gray-600 mt-2">サポート時間: 平日 9:00〜18:00 / 24時間以内に返信します</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-3">利用規約・ポリシー</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              免責事項
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              利用規約
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              プライバシーポリシー
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              特定商取引法に基づく表記
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button
            variant="ghost"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            アカウントを削除
          </Button>
        </div>
      </CardContent>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open)
        if (!open) setConfirmText("")
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウントの削除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">この操作は取り消せません。</p>
              <p className="text-sm text-red-600 mt-1">
                あなたのアカウントが完全に削除されます。会社データや他のメンバーには影響しません。
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                確認のため「<span className="font-mono font-medium">削除する</span>」と入力してください。
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="削除する"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setConfirmText("")
                }}
                disabled={deleting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={confirmText !== "削除する" || deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "削除中..." : "アカウントを削除"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

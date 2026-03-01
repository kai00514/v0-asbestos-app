"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Trash2, Mail } from "lucide-react"
import { ContactDialog } from "./contact-dialog"
import { FAQDialog } from "./faq-dialog"

export function GeneralSettings() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウント削除について</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              現在、アカウント削除機能は実装されていません。
              アカウントの削除をご希望の場合は、お手数ですがお問い合わせください。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">support@example.com</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">サポート時間: 平日 9:00〜18:00</p>
            </div>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

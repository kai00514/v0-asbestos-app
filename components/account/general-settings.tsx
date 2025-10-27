"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Trash2 } from "lucide-react"
import { ContactDialog } from "./contact-dialog"
import { FAQDialog } from "./faq-dialog"

export function GeneralSettings() {
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
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            アカウントを削除
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

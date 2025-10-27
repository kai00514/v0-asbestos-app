"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Gift, Users } from "lucide-react"
import { toast } from "sonner"
import { generateReferralUrl } from "@/app/actions/referral"

export function ReferralProgram() {
  const [referralUrl, setReferralUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReferralUrl()
  }, [])

  const loadReferralUrl = async () => {
    setLoading(true)
    try {
      const url = await generateReferralUrl()
      if (url) {
        setReferralUrl(url)
      } else {
        toast.error("紹介URLの生成に失敗しました")
      }
    } catch (error) {
      console.error("[v0] Error loading referral URL:", error)
      toast.error("紹介URLの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl)
    toast.success("紹介URLをコピーしました")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-600" />
          紹介プログラム
        </CardTitle>
        <CardDescription>友達を招待して、お互いに特典を獲得しましょう</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h4 className="font-medium text-emerald-900">紹介者の特典</h4>
            </div>
            <p className="text-sm text-emerald-700">判定回数 +20回</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">被紹介者の特典</h4>
            </div>
            <p className="text-sm text-blue-700">14日間トライアル + 判定回数 +20回</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">あなたの紹介URL</label>
          <div className="flex gap-2">
            <Input value={referralUrl || "読み込み中..."} readOnly className="flex-1" disabled={loading} />
            <Button onClick={copyToClipboard} disabled={loading || !referralUrl} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">このURLを友達に共有して、お互いに特典を獲得しましょう</p>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Copy } from "lucide-react"
import { toast } from "sonner"

export function AccountInfo({ user }: { user: any }) {
  const copyAccountId = () => {
    navigator.clipboard.writeText(user.id)
    toast.success("アカウントIDをコピーしました")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>アカウント情報</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">株</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">株式会社サンプル</h2>
            <p className="text-gray-600">田中太郎</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">アカウントID</h3>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-3 py-1 rounded flex-1 truncate">{user.id}</code>
              <Button variant="ghost" size="icon" onClick={copyAccountId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-600 mb-1">メールアドレス</h3>
            <div className="flex items-center gap-2">
              <p className="text-base">{user.email}</p>
              <Badge variant="secondary" className="text-xs">
                確認済み
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent">
            メール変更
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            パスワード変更
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

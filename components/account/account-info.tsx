"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { EditAccountDialog } from "./edit-account-dialog"
import { ChangeEmailDialog } from "./change-email-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"
import type { Database } from "@/lib/types/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Company = Database["public"]["Tables"]["companies"]["Row"]

interface AccountInfoProps {
  user: User
  company: Company
}

export function AccountInfo({ user, company }: AccountInfoProps) {
  const copyAccountId = () => {
    navigator.clipboard.writeText(user.id)
    toast.success("アカウントIDをコピーしました")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>アカウント情報</CardTitle>
          <EditAccountDialog user={user} company={company} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
              {company.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            <p className="text-gray-600">{user.name}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">アカウントID</h3>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-3 py-1 rounded flex-1 truncate">{user.id}</code>
              <button onClick={copyAccountId} className="p-2 hover:bg-gray-100 rounded">
                <Copy className="w-4 h-4" />
              </button>
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
          <ChangeEmailDialog />
          <ChangePasswordDialog />
        </div>
      </CardContent>
    </Card>
  )
}

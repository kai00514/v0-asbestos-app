"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { inviteMember } from "@/app/actions/account"

interface CreatedCredentials {
  email: string
  password: string
}

export function AddMemberDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "member" as "owner" | "member",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await inviteMember(formData)
      setCredentials({ email: formData.email, password: result.tempPassword })
    } catch (error: any) {
      toast.error(error.message || "メンバーの追加に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!credentials) return
    const text = `メールアドレス: ${credentials.email}\nパスワード: ${credentials.password}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("コピーしました")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setCredentials(null)
      setCopied(false)
      setFormData({ email: "", name: "", role: "member" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          メンバーを追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{credentials ? "メンバーを追加しました" : "メンバーを追加"}</DialogTitle>
        </DialogHeader>

        {credentials ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              以下のログイン情報をメンバーに共有してください。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">メールアドレス</p>
                <p className="text-sm font-mono font-medium text-gray-900">{credentials.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">パスワード</p>
                <p className="text-sm font-mono font-medium text-gray-900">{credentials.password}</p>
              </div>
            </div>
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
              セキュリティのため、メンバーにはログイン後にパスワードを変更するようお伝えください。
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "コピー済み" : "ログイン情報をコピー"}
              </Button>
              <Button
                onClick={() => handleClose(false)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="member@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">氏名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="山田太郎"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">権限</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "owner" | "member") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">オーナー</SelectItem>
                  <SelectItem value="member">メンバー</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                オーナー: 全ての機能にアクセス可能
                <br />
                メンバー: 判定機能のみ利用可能
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? "追加中..." : "メンバーを追加"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

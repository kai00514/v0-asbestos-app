"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { changeEmail } from "@/app/actions/account"

export function ChangeEmailDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newEmail, setNewEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await changeEmail(newEmail)
      toast.success("確認メールを送信しました。メールを確認してください。")
      setOpen(false)
      setNewEmail("")
    } catch (error) {
      toast.error("メール変更に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 bg-transparent">
          メール変更
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メールアドレスの変更</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">新しいメールアドレス</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              required
            />
            <p className="text-sm text-gray-500">
              確認メールが送信されます。メール内のリンクをクリックして変更を完了してください。
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "送信中..." : "確認メールを送信"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

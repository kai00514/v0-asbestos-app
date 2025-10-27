"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { changePassword } from "@/app/actions/account"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("新しいパスワードが一致しません")
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error("パスワードは8文字以上で入力してください")
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("新しいパスワードは現在のパスワードと異なるものを入力してください")
      return
    }

    setLoading(true)

    try {
      await changePassword(formData.currentPassword, formData.newPassword)

      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut().catch(() => {
        console.log("[v0] Session already invalidated, ignoring signOut error")
      })

      toast.success("パスワードが変更されました。新しいパスワードでログインしてください。")

      setOpen(false)

      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "パスワード変更に失敗しました"
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 bg-transparent">
          パスワード変更
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>パスワードの変更</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">現在のパスワード</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              minLength={8}
            />
            <p className="text-sm text-gray-500">8文字以上で入力してください</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "変更中..." : "変更"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

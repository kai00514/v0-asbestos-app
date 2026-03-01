"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (!res.ok) throw new Error()
      router.push("/login")
    } catch {
      toast.error("ログアウトに失敗しました")
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      {loading ? "ログアウト中..." : "ログアウト"}
    </Button>
  )
}

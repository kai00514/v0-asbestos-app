"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ArticleHeader({ articleId }: { articleId: string }) {
  const router = useRouter()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "アスベスト判定の精度向上について",
          text: "アスベスト判定アプリの最新情報",
          url: window.location.href,
        })
      } catch (error) {
        console.error("[v0] Share error:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("URLをコピーしました")
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-3xl">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

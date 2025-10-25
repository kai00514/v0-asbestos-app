"use client"

import { Bell, Menu, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useRouter } from "next/navigation"

const notifications = [
  {
    id: 1,
    type: "limit",
    title: "判定上限に達しました",
    message: "今月の判定回数が上限に達しました",
    time: "3時間前",
    read: false,
    icon: "🔴",
  },
  {
    id: 2,
    type: "detection",
    title: "判定が完了しました",
    message: "田中太郎が「外壁スレート」を判定しました",
    time: "5時間前",
    read: false,
    icon: "🔵",
  },
  {
    id: 3,
    type: "card",
    title: "カードの有効期限が近づいています",
    message: "登録されているカードの有効期限が来月末です",
    time: "1日前",
    read: true,
    icon: "🟡",
  },
]

interface WaveHeaderProps {
  title?: string
  showBackButton?: boolean
  showLogo?: boolean
}

export function WaveHeader({ title, showBackButton = false, showLogo = true }: WaveHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(notifications.filter((n) => !n.read).length)
  const router = useRouter()

  return (
    <header className="relative bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-500 overflow-hidden">
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ height: "120px" }}
      >
        <path
          fill="rgb(209, 213, 219)"
          d="M0,60 Q120,100 240,90 T480,70 T720,55 T960,45 T1200,40 T1440,35 L1440,120 L0,120 Z"
        />
      </svg>

      <div className="relative px-4 pt-4 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {showLogo && (
              <>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">VizyAs</span>
              </>
            )}
            {title && !showLogo && <h1 className="text-white font-bold text-xl">{title}</h1>}
          </div>

          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 rounded-full">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-emerald-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>通知</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read ? "bg-gray-50 opacity-70" : "bg-white"
                        } cursor-pointer hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex gap-3">
                          <span className="text-2xl">{notification.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4">
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setUnreadCount(0)}>
                    すべて既読にする
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {title && showLogo && (
          <div className="mt-4">
            <h1 className="text-white font-bold text-2xl">{title}</h1>
          </div>
        )}
      </div>
    </header>
  )
}

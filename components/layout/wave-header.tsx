"use client"

import { Bell, Menu, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { NotificationPanel } from "@/components/notifications/notification-panel"

interface WaveHeaderProps {
  title?: string
  showBackButton?: boolean
  showLogo?: boolean
}

export function WaveHeader({ title, showBackButton = false, showLogo = true }: WaveHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

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
                <NotificationPanel onUnreadCountChange={handleUnreadCountChange} />
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

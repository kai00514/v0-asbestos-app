"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CreditCard,
  Shield,
  UserPlus,
  UserMinus,
  FileText,
  Megaphone,
  BellOff,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database } from "@/lib/types/database.types"

type NotificationType = Database["public"]["Enums"]["notification_type"]
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]

const typeConfig: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  limit_reached: { icon: AlertTriangle, color: "text-red-500 bg-red-50" },
  limit_warning: { icon: AlertTriangle, color: "text-amber-500 bg-amber-50" },
  payment_failed: { icon: CreditCard, color: "text-red-500 bg-red-50" },
  payment_succeeded: { icon: CreditCard, color: "text-emerald-500 bg-emerald-50" },
  card_expiring: { icon: CreditCard, color: "text-amber-500 bg-amber-50" },
  detection_completed: { icon: Shield, color: "text-blue-500 bg-blue-50" },
  member_added: { icon: UserPlus, color: "text-emerald-500 bg-emerald-50" },
  member_removed: { icon: UserMinus, color: "text-gray-500 bg-gray-50" },
  article_published: { icon: FileText, color: "text-blue-500 bg-blue-50" },
  system_announcement: { icon: Megaphone, color: "text-purple-500 bg-purple-50" },
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "たった今"
  if (diffMin < 60) return `${diffMin}分前`
  if (diffHour < 24) return `${diffHour}時間前`
  if (diffDay < 30) return `${diffDay}日前`
  return date.toLocaleDateString("ja-JP")
}

interface NotificationPanelProps {
  onUnreadCountChange?: (count: number) => void
}

export function NotificationPanel({ onUnreadCountChange }: NotificationPanelProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const json = await res.json()
      const data: NotificationRow[] = json.data ?? []
      setNotifications(data)
      onUnreadCountChange?.(data.filter((n) => !n.is_read).length)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [onUnreadCountChange])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleRead = async (notification: NotificationRow) => {
    if (!notification.is_read) {
      await fetch(`/api/notifications/${notification.id}/read`, { method: "PATCH" })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
      )
      onUnreadCountChange?.(notifications.filter((n) => !n.is_read && n.id !== notification.id).length)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/mark-all-read", { method: "POST" })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    onUnreadCountChange?.(0)
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <BellOff className="h-10 w-10 mb-3" />
        <p className="text-sm">通知はありません</p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] ?? typeConfig.system_announcement
            const Icon = config.icon
            const [textColor, bgColor] = config.color.split(" ")
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all ${
                  notification.is_read
                    ? "bg-gray-50 opacity-70 border-gray-200"
                    : "bg-white border-emerald-200 shadow-sm"
                } cursor-pointer hover:shadow-md hover:border-emerald-300`}
                onClick={() => handleRead(notification)}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${bgColor}`}>
                    <Icon className={`h-4 w-4 ${textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      {unreadCount > 0 && (
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full bg-transparent hover:bg-emerald-50"
            onClick={handleMarkAllRead}
          >
            すべて既読にする
          </Button>
        </div>
      )}
    </>
  )
}

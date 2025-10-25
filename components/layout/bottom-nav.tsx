"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, List, Camera, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "トップ", icon: Home },
  { href: "/detections", label: "一覧", icon: List },
  { href: "/ai", label: "判定", icon: Camera, primary: true },
  { href: "/labs", label: "分析", icon: Building2 },
  { href: "/account", label: "設定", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-emerald-600" : "text-gray-600",
                item.primary && "relative",
              )}
            >
              {item.primary ? (
                <div className="absolute -top-6 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

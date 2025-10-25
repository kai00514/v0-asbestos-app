"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

interface Account {
  id: string
  name: string
  avatar?: string
  role: "owner" | "employee"
}

const mockAccounts: Account[] = [
  { id: "all", name: "All", role: "owner" },
  { id: "1", name: "田中太郎", avatar: "/abstract-geometric-shapes.png", role: "owner" },
  { id: "2", name: "佐藤花子", avatar: "/abstract-geometric-shapes.png", role: "employee" },
  { id: "3", name: "鈴木一郎", avatar: "/diverse-group-collaborating.png", role: "employee" },
  { id: "4", name: "高橋美咲", avatar: "/abstract-geometric-shapes.png", role: "employee" },
]

export function AccountSelector() {
  const [selectedAccount, setSelectedAccount] = useState("all")

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {mockAccounts.map((account) => (
          <button
            key={account.id}
            onClick={() => setSelectedAccount(account.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 min-w-[60px] transition-all",
              selectedAccount === account.id && "scale-105",
            )}
          >
            <div
              className={cn(
                "relative rounded-full p-0.5 transition-all",
                selectedAccount === account.id
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md"
                  : "bg-gray-200",
              )}
            >
              {account.id === "all" ? (
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              ) : (
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={account.avatar || "/placeholder.svg"} alt={account.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {account.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                selectedAccount === account.id ? "text-emerald-600" : "text-gray-600",
              )}
            >
              {account.id === "all" ? "全員" : account.name.split("").slice(0, 3).join("")}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

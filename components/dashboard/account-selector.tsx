"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import type { Database } from "@/lib/types/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

interface AccountSelectorProps {
  teamMembers: User[]
  selectedUserId: string
}

export function AccountSelector({ teamMembers, selectedUserId }: AccountSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelectAccount = (userId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("user", userId)
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
        <button
          onClick={() => handleSelectAccount("all")}
          className={cn(
            "flex flex-col items-center gap-1.5 min-w-[60px] transition-all",
            selectedUserId === "all" && "scale-105",
          )}
        >
          <div
            className={cn(
              "relative rounded-full p-0.5 transition-all",
              selectedUserId === "all" ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md" : "bg-gray-200",
            )}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              selectedUserId === "all" ? "text-emerald-600" : "text-gray-600",
            )}
          >
            全員
          </span>
        </button>

        {teamMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => handleSelectAccount(member.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 min-w-[60px] transition-all",
              selectedUserId === member.id && "scale-105",
            )}
          >
            <div
              className={cn(
                "relative rounded-full p-0.5 transition-all",
                selectedUserId === member.id
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md"
                  : "bg-gray-200",
              )}
            >
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                  {member.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                selectedUserId === member.id ? "text-emerald-600" : "text-gray-600",
              )}
            >
              {member.name.split("").slice(0, 3).join("")}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

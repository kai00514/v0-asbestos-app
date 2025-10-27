"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardTabsProps {
  period: "today" | "week" | "month"
}

export function DashboardTabs({ period }: DashboardTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", value)
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <Tabs value={period} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-11 bg-white rounded-xl shadow-sm p-1">
        <TabsTrigger
          value="today"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium transition-all"
        >
          今日
        </TabsTrigger>
        <TabsTrigger
          value="week"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium transition-all"
        >
          今週
        </TabsTrigger>
        <TabsTrigger
          value="month"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium transition-all"
        >
          今月
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

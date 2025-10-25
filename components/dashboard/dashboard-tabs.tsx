"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("month")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X, AlertTriangle, Shield, Clock, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"

type ResultFilter = "all" | "detected" | "not-detected" | "pending"

export function DetectionFilters() {
  const [search, setSearch] = useState("")
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all")

  const resultOptions: { value: ResultFilter; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
    {
      value: "all",
      label: "すべて",
      icon: null,
      color: "border-gray-300 text-gray-600 bg-white",
      activeColor: "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30",
    },
    {
      value: "detected",
      label: "含有あり",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      color: "border-gray-300 text-gray-600 bg-white",
      activeColor: "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500/30",
    },
    {
      value: "not-detected",
      label: "含有なし",
      icon: <Shield className="w-3.5 h-3.5" />,
      color: "border-gray-300 text-gray-600 bg-white",
      activeColor: "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30",
    },
    {
      value: "pending",
      label: "未実施",
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "border-gray-300 text-gray-600 bg-white",
      activeColor: "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500/30",
    },
  ]

  const hasActiveFilter = resultFilter !== "all"

  const handleReset = () => {
    setResultFilter("all")
  }

  return (
    <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 p-4 mb-5">
      <div className="flex gap-2.5 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="試料名・現場・住所で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-white/80 border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm placeholder:text-gray-400"
          />
        </div>

        <Select defaultValue="newest">
          <SelectTrigger className="w-32 h-10 bg-white/80 border-gray-300 rounded-xl text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">新着順</SelectItem>
            <SelectItem value="oldest">古い順</SelectItem>
            <SelectItem value="result">判定結果順</SelectItem>
            <SelectItem value="site">現場名順</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`h-10 w-10 rounded-xl transition-all relative ${
                hasActiveFilter
                  ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                  : "bg-white/80 border-gray-300 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px] sm:w-[360px]">
            <SheetHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-bold text-gray-900">フィルタ</SheetTitle>
                {hasActiveFilter && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    リセット
                  </button>
                )}
              </div>
            </SheetHeader>

            <div className="py-6">
              {/* 判定結果 */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">判定結果</p>
                <div className="grid grid-cols-2 gap-2">
                  {resultOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setResultFilter(option.value)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        resultFilter === option.value ? option.activeColor : option.color
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 適用ボタン */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <SheetClose asChild>
                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm">
                  フィルタを適用
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

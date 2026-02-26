"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, AlertTriangle, Shield, Clock, RotateCcw, Calendar, ArrowDownUp, Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

type ResultFilter = "all" | "detected" | "not-detected" | "pending"
type PeriodFilter = "all" | "today" | "week" | "month" | "3months"
type SortOption = "newest" | "oldest" | "result" | "site"

export function DetectionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentResult = searchParams.get("result")
  const currentSort = (searchParams.get("sort") as SortOption) || "newest"
  const currentSearch = searchParams.get("search") || ""

  // searchParamsからresultFilterの初期値を導出
  const deriveResultFilter = (): ResultFilter => {
    if (currentResult === "true") return "detected"
    if (currentResult === "false") return "not-detected"
    return "all"
  }

  // searchParamsからperiodFilterの初期値を導出
  const derivePeriodFilter = (): PeriodFilter => {
    const start = searchParams.get("startDate")
    if (!start) return "all"
    const today = new Date().toISOString().split("T")[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
    const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0]
    if (start === today) return "today"
    if (start === weekAgo) return "week"
    if (start === monthAgo) return "month"
    if (start === threeMonthsAgo) return "3months"
    return "all"
  }

  const [search, setSearch] = useState(currentSearch)
  const [resultFilter, setResultFilter] = useState<ResultFilter>(deriveResultFilter)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(derivePeriodFilter)
  const [sortBy, setSortBy] = useState<SortOption>(currentSort)

  const buildUrl = useCallback((overrides?: {
    search?: string
    result?: ResultFilter
    period?: PeriodFilter
    sort?: SortOption
  }) => {
    const params = new URLSearchParams()

    const s = overrides?.search ?? search
    const r = overrides?.result ?? resultFilter
    const p = overrides?.period ?? periodFilter
    const so = overrides?.sort ?? sortBy

    if (s) params.set("search", s)
    if (r === "detected") params.set("result", "true")
    else if (r === "not-detected") params.set("result", "false")

    if (p !== "all") {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      let startDate = ""
      if (p === "today") startDate = today
      else if (p === "week") startDate = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
      else if (p === "month") startDate = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
      else if (p === "3months") startDate = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0]
      if (startDate) params.set("startDate", startDate)
    }

    if (so !== "newest") params.set("sort", so)

    const qs = params.toString()
    return `/detections${qs ? `?${qs}` : ""}`
  }, [search, resultFilter, periodFilter, sortBy])

  // 検索実行（Enter or blur）
  const handleSearch = useCallback(() => {
    router.push(buildUrl({ search }))
  }, [router, buildUrl, search])

  // フィルター適用
  const handleApply = useCallback(() => {
    router.push(buildUrl())
  }, [router, buildUrl])

  const handleReset = () => {
    setResultFilter("all")
    setPeriodFilter("all")
    setSortBy("newest")
    setSearch("")
    router.push("/detections")
  }

  const resultOptions: { value: ResultFilter; label: string; icon: React.ReactNode; activeClass: string }[] = [
    {
      value: "all",
      label: "すべて",
      icon: <Layers className="w-4 h-4" />,
      activeClass: "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20",
    },
    {
      value: "detected",
      label: "含有あり",
      icon: <AlertTriangle className="w-4 h-4" />,
      activeClass: "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30",
    },
    {
      value: "not-detected",
      label: "含有なし",
      icon: <Shield className="w-4 h-4" />,
      activeClass: "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30",
    },
    {
      value: "pending",
      label: "未実施",
      icon: <Clock className="w-4 h-4" />,
      activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30",
    },
  ]

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: "all", label: "全期間" },
    { value: "today", label: "今日" },
    { value: "week", label: "今週" },
    { value: "month", label: "今月" },
    { value: "3months", label: "3ヶ月" },
  ]

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "新着順" },
    { value: "oldest", label: "古い順" },
    { value: "result", label: "判定結果順" },
    { value: "site", label: "現場名順" },
  ]

  const hasActiveFilter = resultFilter !== "all" || periodFilter !== "all"
  const activeFilterCount = (resultFilter !== "all" ? 1 : 0) + (periodFilter !== "all" ? 1 : 0)

  return (
    <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 p-4 mb-5">
      <div className="flex gap-2.5 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="試料名・現場・住所で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
            className="pl-10 h-10 bg-white/80 border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm placeholder:text-gray-400"
          />
        </div>

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
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px] sm:w-[380px] p-0 flex flex-col">
            {/* ヘッダー */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">フィルタ</h2>
                  <p className="text-xs text-gray-500 mt-0.5">条件を絞り込んで検索</p>
                </div>
                {(hasActiveFilter || sortBy !== "newest") && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    リセット
                  </button>
                )}
              </div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto px-5 pb-24">
              {/* 判定結果セクション */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">判定結果</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {resultOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setResultFilter(option.value)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                        resultFilter === option.value
                          ? option.activeClass
                          : "border-gray-200 text-gray-500 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 期間セクション */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">期間</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPeriodFilter(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        periodFilter === option.value
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gray-50/50 text-gray-500 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 並び替えセクション */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <ArrowDownUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">並び替え</span>
                </div>
                <div className="space-y-1.5">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        sortBy === option.value
                          ? "bg-purple-50 text-purple-700 border-2 border-purple-300"
                          : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 適用ボタン（固定フッター） */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200">
              <SheetClose asChild>
                <Button
                  onClick={handleApply}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/30 transition-all"
                >
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

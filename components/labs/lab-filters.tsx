"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, MapPin, RotateCcw, ArrowDownUp, Loader2, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"

type SortOption = "rating" | "price" | "delivery" | "track-record"
type DeliveryFilter = "all" | "immediate" | "3days" | "1week"

const PREFECTURE_GROUPS: { label: string; prefectures: string[] }[] = [
  {
    label: "北海道・東北",
    prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    label: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    label: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  {
    label: "近畿",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    label: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  {
    label: "四国",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    label: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rating", label: "評価順" },
  { value: "price", label: "料金順（安い順）" },
  { value: "delivery", label: "納期順（早い順）" },
  { value: "track-record", label: "実績順（多い順）" },
]

const DELIVERY_OPTIONS: { value: DeliveryFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "immediate", label: "即日" },
  { value: "3days", label: "3日以内" },
  { value: "1week", label: "1週間以内" },
]

export function LabFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get("search") || ""
  const currentSort = (searchParams.get("sort") as SortOption) || "rating"
  const currentPrefectures = searchParams.getAll("prefecture")
  const currentDelivery = (searchParams.get("delivery") as DeliveryFilter) || "all"
  const currentZipcode = searchParams.get("zipcode") || ""

  const [search, setSearch] = useState(currentSearch)
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>(currentPrefectures)
  const [sortBy, setSortBy] = useState<SortOption>(currentSort)
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>(currentDelivery)
  const [postalCode, setPostalCode] = useState(currentZipcode ? formatZipDisplay(currentZipcode) : "")
  const [postalLoading, setPostalLoading] = useState(false)
  const [postalError, setPostalError] = useState("")
  const [postalResult, setPostalResult] = useState("")
  const [resolvedZipcode, setResolvedZipcode] = useState(currentZipcode)

  const buildUrl = useCallback((overrides?: {
    search?: string
    prefectures?: string[]
    sort?: SortOption
    delivery?: DeliveryFilter
    zipcode?: string
  }) => {
    const params = new URLSearchParams()

    const s = overrides?.search ?? search
    const prefs = overrides?.prefectures ?? selectedPrefectures
    const so = overrides?.sort ?? sortBy
    const del = overrides?.delivery ?? deliveryFilter
    const zip = overrides?.zipcode ?? resolvedZipcode

    if (s) params.set("search", s)
    for (const p of prefs) {
      params.append("prefecture", p)
    }
    if (so !== "rating") params.set("sort", so)
    if (del !== "all") params.set("delivery", del)
    if (zip) params.set("zipcode", zip)

    // Preserve detectionId if present
    const detectionId = searchParams.get("detectionId")
    if (detectionId) params.set("detectionId", detectionId)

    const qs = params.toString()
    return `/labs${qs ? `?${qs}` : ""}`
  }, [search, selectedPrefectures, sortBy, deliveryFilter, resolvedZipcode, searchParams])

  const handleSearch = useCallback(() => {
    router.push(buildUrl({ search }))
  }, [router, buildUrl, search])

  const handleApply = useCallback(() => {
    router.push(buildUrl())
  }, [router, buildUrl])

  const handleReset = () => {
    setSelectedPrefectures([])
    setSortBy("rating")
    setDeliveryFilter("all")
    setSearch("")
    setPostalCode("")
    setPostalError("")
    setPostalResult("")
    setResolvedZipcode("")
    const detectionId = searchParams.get("detectionId")
    router.push(detectionId ? `/labs?detectionId=${detectionId}` : "/labs")
  }

  const togglePrefecture = (pref: string) => {
    setSelectedPrefectures((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  const handlePostalSearch = async () => {
    const cleaned = postalCode.replace(/[-ー－\s]/g, "")
    if (!/^\d{7}$/.test(cleaned)) {
      setPostalError("7桁の郵便番号を入力してください")
      return
    }
    setPostalLoading(true)
    setPostalError("")
    setPostalResult("")
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const r = data.results[0]
        const address = `${r.address1}${r.address2}${r.address3}`
        setResolvedZipcode(cleaned)
        setPostalResult(address)
        setPostalError("")
      } else {
        setPostalError("該当する住所が見つかりませんでした")
      }
    } catch {
      setPostalError("郵便番号の検索に失敗しました")
    } finally {
      setPostalLoading(false)
    }
  }

  const clearPostalSearch = () => {
    setPostalCode("")
    setPostalResult("")
    setResolvedZipcode("")
  }

  const hasActiveFilter =
    selectedPrefectures.length > 0 ||
    sortBy !== "rating" ||
    deliveryFilter !== "all" ||
    resolvedZipcode !== ""
  const activeFilterCount =
    (selectedPrefectures.length > 0 ? 1 : 0) +
    (sortBy !== "rating" ? 1 : 0) +
    (deliveryFilter !== "all" ? 1 : 0) +
    (resolvedZipcode !== "" ? 1 : 0)

  return (
    <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 p-4 mb-5">
      <div className="flex gap-2.5 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="機関名・地域で検索"
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
                  <SheetTitle className="text-lg font-bold text-gray-900">フィルタ</SheetTitle>
                  <p className="text-xs text-gray-500 mt-0.5">条件を絞り込んで検索</p>
                </div>
                {hasActiveFilter && (
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
              {/* 郵便番号検索 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">郵便番号から近い順に表示</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">入力した郵便番号に近い分析機関から順に表示します</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="例: 100-0001"
                    value={postalCode}
                    onChange={(e) => { setPostalCode(e.target.value); setPostalError("") }}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePostalSearch() }}
                    className="flex-1 h-9 bg-gray-50 border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <Button
                    onClick={handlePostalSearch}
                    disabled={postalLoading}
                    size="sm"
                    className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    {postalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "検索"}
                  </Button>
                </div>
                {postalError && (
                  <p className="text-xs text-red-500 mt-1.5">{postalError}</p>
                )}
                {postalResult && (
                  <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">{postalResult}</p>
                      <p className="text-[10px] text-blue-500">この地域に近い順に並び替えます</p>
                    </div>
                    <button
                      onClick={clearPostalSearch}
                      className="text-xs text-blue-400 hover:text-red-500 ml-2 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 対応地域 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">対応地域</span>
                  {selectedPrefectures.length > 0 && (
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      {selectedPrefectures.length}件選択
                    </span>
                  )}
                </div>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                  {PREFECTURE_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-bold text-gray-500 mb-1.5 sticky top-0 bg-white/90 backdrop-blur-sm py-1">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {group.prefectures.map((pref) => (
                          <div key={pref} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pref-${pref}`}
                              checked={selectedPrefectures.includes(pref)}
                              onCheckedChange={() => togglePrefecture(pref)}
                            />
                            <label
                              htmlFor={`pref-${pref}`}
                              className="text-sm cursor-pointer select-none"
                            >
                              {pref}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 納期 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">納期</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDeliveryFilter(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        deliveryFilter === option.value
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gray-50/50 text-gray-500 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 並び替え */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <ArrowDownUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">並び替え</span>
                </div>
                <div className="space-y-1.5">
                  {SORT_OPTIONS.map((option) => (
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

function formatZipDisplay(zip: string): string {
  if (zip.length === 7) return `${zip.slice(0, 3)}-${zip.slice(3)}`
  return zip
}

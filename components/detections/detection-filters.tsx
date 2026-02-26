"use client"

import { useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function DetectionFilters() {
  const [search, setSearch] = useState("")

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
              className="h-10 w-10 bg-white/80 border-gray-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>フィルタ</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">判定結果</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="detected" />
                    <label htmlFor="detected" className="text-sm">
                      検出あり
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="not-detected" />
                    <label htmlFor="not-detected" className="text-sm">
                      検出なし
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pending" />
                    <label htmlFor="pending" className="text-sm">
                      未実施
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  リセット
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">適用</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

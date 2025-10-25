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
    <div className="space-y-4 mb-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="試料名・現場・住所で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 bg-transparent">
              <SlidersHorizontal className="h-5 w-5" />
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

      <Select defaultValue="newest">
        <SelectTrigger className="w-full md:w-48 h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">新着順</SelectItem>
          <SelectItem value="oldest">古い順</SelectItem>
          <SelectItem value="result">判定結果順</SelectItem>
          <SelectItem value="site">現場名順</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

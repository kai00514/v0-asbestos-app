"use client"

import { useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function LabFilters() {
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="機関名・地域で検索"
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
                <Label className="text-base font-medium">対応地域</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {["東京都", "神奈川県", "埼玉県", "千葉県", "大阪府", "愛知県"].map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox id={region} />
                      <label htmlFor={region} className="text-sm">
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">実績件数</Label>
                <Slider defaultValue={[100]} max={1000} step={50} className="mt-2" />
                <p className="text-xs text-gray-600">100件以上</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">料金範囲</Label>
                <Slider defaultValue={[10000, 50000]} max={100000} step={5000} className="mt-2" />
                <p className="text-xs text-gray-600">¥10,000 〜 ¥50,000</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">納期</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="immediate" />
                    <label htmlFor="immediate" className="text-sm">
                      即日
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="3days" />
                    <label htmlFor="3days" className="text-sm">
                      3日以内
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="1week" />
                    <label htmlFor="1week" className="text-sm">
                      1週間以内
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

      <Select defaultValue="distance">
        <SelectTrigger className="w-full md:w-48 h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="distance">距離順</SelectItem>
          <SelectItem value="price">料金順（安い順）</SelectItem>
          <SelectItem value="delivery">納期順（早い順）</SelectItem>
          <SelectItem value="track-record">実績順（多い順）</SelectItem>
          <SelectItem value="rating">評価順（高い順）</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

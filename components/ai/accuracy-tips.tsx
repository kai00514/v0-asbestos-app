"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function AccuracyTips() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="text-base">撮影のコツ</CardTitle>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📏</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">撮影距離</h4>
                  <p className="text-sm text-gray-600">1〜2m</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">光源</h4>
                  <p className="text-sm text-gray-600">十分な自然光 or LED</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📐</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">角度</h4>
                  <p className="text-sm text-gray-600">正面（斜め45度以内）</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🖼️</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">解像度</h4>
                  <p className="text-sm text-gray-600">最低1000x1000px</p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📸</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">複数枚撮影</h4>
                  <p className="text-sm text-gray-600">異なる角度から3枚以上</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

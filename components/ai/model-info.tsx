"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function ModelInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="text-base">AIモデル情報</CardTitle>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">モデル名:</span> AsbestosNet v2.1
            </div>
            <div>
              <span className="font-medium">バージョン:</span> 2.1.0
            </div>
            <div>
              <span className="font-medium">最終更新:</span> 2025年10月
            </div>
            <div>
              <span className="font-medium">既知の制限:</span>
              <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                <li>濡れた表面では精度が低下する可能性があります</li>
                <li>極端な逆光では誤検出の可能性があります</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

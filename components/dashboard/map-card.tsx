"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export function MapCard() {
  return (
    <Card className="bg-white shadow-sm rounded-xl border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">地図</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          <img src="/map-with-location-pin.png" alt="地図" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

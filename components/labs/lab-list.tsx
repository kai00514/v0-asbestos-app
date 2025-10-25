import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const labs = [
  {
    id: 1,
    name: "東京アスベスト分析センター",
    logo: "/lab-logo-1.png",
    rating: 4.8,
    reviewCount: 234,
    address: "東京都渋谷区渋谷1-1-1",
    distance: "3.2km",
    deliveryTime: "3〜5営業日",
    priceFrom: "¥15,000",
    serviceArea: "関東全域",
    trackRecord: "1,234件",
    phone: "03-1234-5678",
    website: "https://example.com",
  },
  {
    id: 2,
    name: "関東環境分析ラボ",
    logo: "/lab-logo-2.png",
    rating: 4.6,
    reviewCount: 189,
    address: "東京都新宿区新宿2-2-2",
    distance: "5.8km",
    deliveryTime: "即日〜3営業日",
    priceFrom: "¥18,000",
    serviceArea: "関東全域",
    trackRecord: "987件",
    phone: "03-2345-6789",
    website: "https://example.com",
  },
  {
    id: 3,
    name: "首都圏アスベスト検査所",
    logo: "/lab-logo-3.png",
    rating: 4.9,
    reviewCount: 312,
    address: "東京都品川区品川3-3-3",
    distance: "7.1km",
    deliveryTime: "5〜7営業日",
    priceFrom: "¥12,000",
    serviceArea: "東京・神奈川",
    trackRecord: "2,156件",
    phone: "03-3456-7890",
    website: "https://example.com",
  },
]

export function LabList() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">全{labs.length}件</p>

      {labs.map((lab) => (
        <Card key={lab.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={lab.logo || "/placeholder.svg"} alt={lab.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{lab.name}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{lab.rating}</span>
                    <span className="text-xs text-gray-500">({lab.reviewCount})</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{lab.address}</span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {lab.distance}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      納期: {lab.deliveryTime}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {lab.priceFrom}〜
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {lab.serviceArea}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      実績: {lab.trackRecord}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <a
                      href={`tel:${lab.phone}`}
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{lab.phone}</span>
                    </a>
                    <a
                      href={lab.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Webサイト</span>
                    </a>
                  </div>
                </div>

                <div className="mt-4">
                  <Button disabled className="w-full md:w-auto bg-gray-300 text-gray-500 cursor-not-allowed">
                    申込フォーム（近日公開）
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

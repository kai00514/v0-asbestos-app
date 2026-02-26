import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, ExternalLink, Star, Clock, Building2 } from "lucide-react"
import type { LabData } from "@/app/labs/page"

interface LabListProps {
  labs: LabData[]
}

function formatPrice(min: number | null, max: number | null): string {
  if (min && max) return `¥${min.toLocaleString()}〜¥${max.toLocaleString()}`
  if (min) return `¥${min.toLocaleString()}〜`
  if (max) return `〜¥${max.toLocaleString()}`
  return "要問合せ"
}

function formatDelivery(min: number | null, max: number | null): string {
  if (min && max) {
    if (min === max) return `${min}営業日`
    return `${min}〜${max}営業日`
  }
  if (min) return `${min}営業日〜`
  if (max) return `〜${max}営業日`
  return "要問合せ"
}

export function LabList({ labs }: LabListProps) {
  if (labs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">分析機関が見つかりませんでした</p>
        <p className="text-sm text-gray-500 mt-2">条件を変更して再度検索してください。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">全{labs.length}件</p>
      </div>

      <div className="space-y-3">
        {labs.map((lab) => (
          <Card key={lab.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all">
            <CardContent className="p-5">
              <div className="space-y-3">
                {/* ヘッダー：名前と評価 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900 truncate">{lab.name}</h3>
                      {lab.is_featured && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] flex-shrink-0">
                          おすすめ
                        </Badge>
                      )}
                    </div>
                    {lab.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{lab.description}</p>
                    )}
                  </div>
                  {lab.rating && (
                    <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm text-gray-900">{lab.rating.toFixed(1)}</span>
                      {lab.review_count && (
                        <span className="text-[10px] text-gray-500">({lab.review_count})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 住所 */}
                {lab.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{lab.address}</span>
                  </div>
                )}

                {/* バッジ情報 */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-gray-200 font-normal flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    納期: {formatDelivery(lab.delivery_days_min, lab.delivery_days_max)}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-gray-200 font-normal">
                    {formatPrice(lab.price_min, lab.price_max)}
                  </Badge>
                  {lab.service_area && (
                    <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-gray-200 font-normal">
                      {lab.service_area}
                    </Badge>
                  )}
                  {lab.track_record && (
                    <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-gray-200 font-normal">
                      実績: {lab.track_record.toLocaleString()}件
                    </Badge>
                  )}
                </div>

                {/* 認定情報 */}
                {lab.certifications && lab.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {lab.certifications.map((cert) => (
                      <Badge key={cert} className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 py-0">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 連絡先 */}
                <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                  {lab.phone && (
                    <a
                      href={`tel:${lab.phone}`}
                      className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lab.phone}</span>
                    </a>
                  )}
                  {lab.website_url && (
                    <a
                      href={lab.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Webサイト</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, ExternalLink, Star, Clock, Building2, Award, Banknote } from "lucide-react"
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
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-700 font-semibold">分析機関が見つかりませんでした</p>
        <p className="text-sm text-gray-500 mt-2">条件を変更して再度検索してください。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm font-semibold text-gray-500">全 {labs.length} 件</p>
      </div>

      <div className="space-y-2.5">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className={`
              group relative backdrop-blur-xl rounded-2xl p-5 transition-all duration-200
              ${lab.is_featured
                ? "bg-gradient-to-br from-white/90 to-emerald-50/40 border-2 border-emerald-300/70 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100/50"
                : "bg-white/80 border-2 border-gray-200/80 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50"
              }
            `}
          >
            {/* おすすめバッジ */}
            {lab.is_featured && (
              <div className="absolute -top-2.5 right-4">
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-md shadow-amber-200/50 text-[11px] font-bold px-3 py-0.5 rounded-full">
                  おすすめ
                </Badge>
              </div>
            )}

            <div className="space-y-3">
              {/* ヘッダー：名前と評価 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 truncate">{lab.name}</h3>
                  </div>
                  {lab.description && (
                    <p className="text-xs text-gray-500 mt-1.5 ml-10 line-clamp-1">{lab.description}</p>
                  )}
                </div>
                {lab.rating && (
                  <div className="flex items-center gap-1 flex-shrink-0 bg-gradient-to-br from-yellow-50 to-amber-50 px-2.5 py-1 rounded-xl border border-yellow-200/60 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm text-gray-900">{lab.rating.toFixed(1)}</span>
                    {lab.review_count && (
                      <span className="text-[10px] text-gray-500 font-medium">({lab.review_count})</span>
                    )}
                  </div>
                )}
              </div>

              {/* 住所 */}
              {lab.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 ml-10">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{lab.address}</span>
                </div>
              )}

              {/* 情報グリッド */}
              <div className="grid grid-cols-2 gap-2 ml-10">
                <div className="flex items-center gap-1.5 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-200/50">
                  <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium leading-none">納期</p>
                    <p className="text-xs text-gray-700 font-semibold">{formatDelivery(lab.delivery_days_min, lab.delivery_days_max)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-200/50">
                  <Banknote className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium leading-none">料金</p>
                    <p className="text-xs text-gray-700 font-semibold">{formatPrice(lab.price_min, lab.price_max)}</p>
                  </div>
                </div>
              </div>

              {/* サービスエリア・実績 */}
              <div className="flex flex-wrap gap-1.5 ml-10">
                {lab.service_area && (
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-50/80 text-blue-600 border border-blue-200/50 font-medium">
                    {lab.service_area}
                  </span>
                )}
                {lab.track_record && (
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-50/80 text-purple-600 border border-purple-200/50 font-medium">
                    実績 {lab.track_record.toLocaleString()}件
                  </span>
                )}
              </div>

              {/* 認定情報 */}
              {lab.certifications && lab.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-10">
                  {lab.certifications.map((cert) => (
                    <span key={cert} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 font-medium">
                      <Award className="w-3 h-3" />
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* 連絡先 */}
              <div className="flex items-center gap-3 pt-2.5 ml-10 border-t border-gray-200/60">
                {lab.phone && (
                  <a
                    href={`tel:${lab.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/50 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {lab.phone}
                  </a>
                )}
                {lab.website_url && (
                  <a
                    href={lab.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50/50 hover:bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-200/50 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Webサイト
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

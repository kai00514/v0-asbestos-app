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
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 p-10 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Building2 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-700 font-semibold text-sm">分析機関が見つかりませんでした</p>
        <p className="text-xs text-gray-500 mt-1">条件を変更して再度検索してください。</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 mb-2 px-0.5">全 {labs.length} 件</p>

      <div className="space-y-2">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className={`
              group relative backdrop-blur-xl rounded-xl px-3.5 py-3 transition-all duration-200
              ${lab.is_featured
                ? "bg-gradient-to-br from-white/90 to-emerald-50/40 border-2 border-emerald-400 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100/50"
                : "bg-white/80 border-2 border-gray-300 hover:border-gray-400 hover:shadow-md hover:shadow-gray-200/50"
              }
            `}
          >
            {/* おすすめバッジ */}
            {lab.is_featured && (
              <div className="absolute -top-2 right-3">
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-sm shadow-amber-200/50 text-[10px] font-bold px-2 py-0 rounded-full leading-relaxed">
                  おすすめ
                </Badge>
              </div>
            )}

            {/* 1行目: アイコン + 名前 + 評価 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 truncate">{lab.name}</h3>
              </div>
              {lab.rating && (
                <div className="flex items-center gap-0.5 flex-shrink-0 bg-gradient-to-br from-yellow-50 to-amber-50 px-1.5 py-0.5 rounded-lg border border-yellow-300">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-xs text-gray-900">{lab.rating.toFixed(1)}</span>
                  {lab.review_count && (
                    <span className="text-[9px] text-gray-500">({lab.review_count})</span>
                  )}
                </div>
              )}
            </div>

            {/* 2行目: 説明（あれば） + 住所 */}
            <div className="mt-1.5 pl-9 space-y-0.5">
              {lab.description && (
                <p className="text-[11px] text-gray-500 line-clamp-1">{lab.description}</p>
              )}
              {lab.address && (
                <div className="flex items-center gap-1 text-[11px] text-gray-700">
                  <MapPin className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{lab.address}</span>
                </div>
              )}
            </div>

            {/* 3行目: 納期・料金グリッド */}
            <div className="grid grid-cols-2 gap-1.5 mt-2 pl-9">
              <div className="flex items-center gap-1 bg-gray-50/80 rounded-lg px-2 py-1 border border-gray-300">
                <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600">納期</span>
                <span className="text-[11px] text-gray-900 font-semibold ml-auto">{formatDelivery(lab.delivery_days_min, lab.delivery_days_max)}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-50/80 rounded-lg px-2 py-1 border border-gray-300">
                <Banknote className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-600">料金</span>
                <span className="text-[11px] text-gray-900 font-semibold ml-auto">{formatPrice(lab.price_min, lab.price_max)}</span>
              </div>
            </div>

            {/* 4行目: タグ類（サービスエリア・実績・認定） */}
            <div className="flex flex-wrap gap-1 mt-1.5 pl-9">
              {lab.service_area && (
                <span className="text-[10px] px-1.5 py-px rounded-md bg-blue-50/80 text-blue-600 border border-blue-300 font-medium">
                  {lab.service_area}
                </span>
              )}
              {lab.track_record && (
                <span className="text-[10px] px-1.5 py-px rounded-md bg-purple-50/80 text-purple-600 border border-purple-300 font-medium">
                  実績 {lab.track_record.toLocaleString()}件
                </span>
              )}
              {lab.certifications && lab.certifications.map((cert) => (
                <span key={cert} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-px rounded-md bg-emerald-50/80 text-emerald-700 border border-emerald-300 font-medium">
                  <Award className="w-2.5 h-2.5" />
                  {cert}
                </span>
              ))}
            </div>

            {/* 5行目: 連絡先 */}
            <div className="flex items-center gap-2 mt-2 pl-9 pt-2 border-t border-gray-300">
              {lab.phone && (
                <a
                  href={`tel:${lab.phone}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-300 transition-all"
                >
                  <Phone className="w-3 h-3" />
                  {lab.phone}
                </a>
              )}
              {lab.website_url && (
                <a
                  href={lab.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50/50 hover:bg-gray-100/80 px-2 py-1 rounded-lg border border-gray-300 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Web
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const plans = [
  {
    id: "basic",
    name: "ベーシック",
    description: "小規模事業者・個人事業主向け",
    monthlyPrice: 9800,
    yearlyPrice: 98000,
    limit: "200回/月",
    users: "最大10ユーザー",
    storage: "10GB",
    features: [
      { name: "AI判定（画像解析）", included: true },
      { name: "判定結果PDF出力", included: true },
      { name: "判定履歴管理", included: true },
      { name: "チーム管理（基本）", included: true },
      { name: "メールサポート", included: true },
      { name: "分析機関検索", included: true },
      { name: "カスタムロゴ", included: false },
      { name: "優先サポート", included: false },
      { name: "API連携", included: false },
    ],
  },
  {
    id: "standard",
    name: "スタンダード",
    description: "中規模建設会社・調査会社向け",
    monthlyPrice: 29800,
    yearlyPrice: 298000,
    limit: "1,000回/月",
    users: "最大50ユーザー",
    storage: "50GB",
    features: [
      { name: "AI判定（画像解析）", included: true },
      { name: "判定結果PDF出力", included: true },
      { name: "判定履歴管理", included: true },
      { name: "チーム管理（高度）", included: true },
      { name: "優先サポート（営業時間内）", included: true },
      { name: "分析機関検索・依頼連携", included: true },
      { name: "カスタムロゴ（報告書）", included: true },
      { name: "一括PDF出力", included: true },
      { name: "API連携", included: false },
    ],
    recommended: true,
  },
  {
    id: "pro",
    name: "エンタープライズ",
    description: "大規模組織・ゼネコン向け",
    monthlyPrice: 79800,
    yearlyPrice: 798000,
    limit: "無制限",
    users: "無制限",
    storage: "無制限",
    features: [
      { name: "AI判定（画像解析）", included: true },
      { name: "判定結果PDF出力", included: true },
      { name: "判定履歴管理", included: true },
      { name: "チーム管理（高度）", included: true },
      { name: "専任カスタマーサクセス", included: true },
      { name: "分析機関検索・依頼連携", included: true },
      { name: "カスタムロゴ（報告書）", included: true },
      { name: "一括PDF出力", included: true },
      { name: "API連携（外部システム統合）", included: true },
    ],
  },
]

export function PricingCards() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const handleSelectPlan = (planId: string) => {
    router.push(`/checkout?plan=${planId}&billing=${billingCycle}`)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">ビジネスに最適なプランを選択</h2>
        <p className="text-sm text-gray-600">すべてのプランに14日間の無料トライアルが含まれます</p>
      </div>

      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="monthly">月額</TabsTrigger>
            <TabsTrigger value="yearly">
              年額
              <Badge variant="secondary" className="ml-2 text-xs bg-emerald-100 text-emerald-700">
                2ヶ月分お得
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.recommended ? "border-2 border-emerald-600 shadow-lg" : "border border-gray-200"}`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-4">おすすめ</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 font-normal">{plan.description}</p>
                <div className="text-3xl font-bold text-emerald-600 mt-3">
                  ¥{billingCycle === "monthly" ? plan.monthlyPrice.toLocaleString() : plan.yearlyPrice.toLocaleString()}
                  <span className="text-sm text-gray-500 font-normal">
                    /{billingCycle === "monthly" ? "月" : "年"}(税抜)
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-xs text-gray-500 mt-1">
                    (月額換算 ¥{Math.round(plan.yearlyPrice / 12).toLocaleString()})
                  </p>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-center">
                <p className="text-sm font-semibold text-gray-900">AI判定: {plan.limit}</p>
                <p className="text-xs text-gray-600">ユーザー数: {plan.users}</p>
                <p className="text-xs text-gray-600">ストレージ: {plan.storage}</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSelectPlan(plan.id)}
              >
                無料で試す
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 text-sm text-gray-700">
        <h3 className="font-semibold text-base text-gray-900">ご利用にあたっての重要事項</h3>
        <ul className="space-y-2 list-disc list-inside text-gray-600">
          <li>すべてのプランには14日間の無料トライアルが含まれます。トライアル期間中のキャンセルは無料です。</li>
          <li>月間判定回数の上限に達した場合、翌月まで新規のAI判定は一時停止されます。追加判定が必要な場合はプランのアップグレードをご検討ください。</li>
          <li>年額プランの途中解約の場合、残存期間分の返金は行っておりません。月額プランへの変更は次回更新日から適用されます。</li>
          <li>プランのアップグレードは即時反映されます。差額は日割り計算にて請求されます。</li>
          <li>お支払い方法はクレジットカード（Visa, Mastercard, JCB, American Express）に対応しています。</li>
          <li>適格請求書（インボイス）の発行に対応しております。アカウント設定の請求管理からダウンロード可能です。</li>
        </ul>
      </div>
    </div>
  )
}

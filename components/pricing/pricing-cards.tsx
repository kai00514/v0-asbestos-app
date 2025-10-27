"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const plans = [
  {
    id: "basic",
    name: "ベーシック",
    monthlyPrice: 9800,
    yearlyPrice: 98000,
    limit: "200回/月",
    users: "最大10ユーザー",
    features: ["PDF出力", "チーム管理", "メールサポート"],
  },
  {
    id: "standard",
    name: "スタンダード",
    monthlyPrice: 29800,
    yearlyPrice: 298000,
    limit: "1,000回/月",
    users: "最大50ユーザー",
    features: ["PDF出力", "チーム管理", "優先サポート", "カスタムロゴ"],
    recommended: true,
    current: true,
  },
  {
    id: "pro",
    name: "プロ",
    monthlyPrice: 79800,
    yearlyPrice: 798000,
    limit: "無制限",
    users: "無制限ユーザー",
    features: ["PDF出力", "チーム管理", "専任サポート", "カスタムロゴ", "API access"],
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
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="monthly">月額</TabsTrigger>
            <TabsTrigger value="yearly">
              年額
              <Badge variant="secondary" className="ml-2 text-xs">
                20% OFF
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {plans.find((p) => p.current) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            現在のプラン: <span className="font-medium">スタンダード</span> / 次回更新: 2025/11/01
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.recommended ? "border-2 border-emerald-600 shadow-lg" : ""}`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-500 text-yellow-900">おすすめ</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-center">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-emerald-600">
                  ¥{billingCycle === "monthly" ? plan.monthlyPrice.toLocaleString() : plan.yearlyPrice.toLocaleString()}
                  <span className="text-base text-gray-600 font-normal">
                    /{billingCycle === "monthly" ? "月" : "年"}
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-gray-600 mt-1">
                    (¥{Math.round(plan.yearlyPrice / 12).toLocaleString()}/月)
                  </p>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-center">
                <p className="font-medium">{plan.limit}</p>
                <p className="text-sm text-gray-600">{plan.users}</p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-11 ${
                  plan.current ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
                disabled={plan.current}
                onClick={() => !plan.current && handleSelectPlan(plan.id)}
              >
                {plan.current ? "現在のプラン" : "このプランを選択"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-100 rounded-lg p-6 space-y-2 text-sm text-gray-700">
        <h3 className="font-medium text-base mb-3">重要事項</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>上限超過時はAI判定が一時停止します</li>
          <li>日割り計算は行いません</li>
          <li>解約後も期間終了まで利用可能です</li>
          <li>請求書発行対応</li>
        </ul>
      </div>
    </div>
  )
}

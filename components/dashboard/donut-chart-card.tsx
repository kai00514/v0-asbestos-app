"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

interface DonutChartCardProps {
  positiveCount: number
  negativeCount: number
  period?: "today" | "week" | "month"
}

const periodLabels: Record<string, string> = {
  today: "今日の判定回数",
  week: "今週の判定回数",
  month: "今月の判定回数",
}

export function DonutChartCard({ positiveCount, negativeCount, period = "month" }: DonutChartCardProps) {
  const data = [
    { name: "検出あり", value: positiveCount, color: "#EF4444" },
    { name: "検出なし", value: negativeCount, color: "#10B981" },
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="bg-white shadow-sm rounded-xl border-0">
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold text-gray-900">{periodLabels[period]}</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            {data.map((item) => (
              <div key={item.name} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 ml-4">{item.value}回</div>
              </div>
            ))}
          </div>

          <div className="relative w-28 h-28 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{total}</div>
                <div className="text-[10px] text-gray-500">合計</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

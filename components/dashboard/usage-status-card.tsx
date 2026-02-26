"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface UsageStatusCardProps {
  currentUsage: number
  monthlyLimit: number
  usagePercentage: number
}

export function UsageStatusCard({ currentUsage, monthlyLimit, usagePercentage }: UsageStatusCardProps) {
  const isWarning = usagePercentage >= 80 && usagePercentage < 100
  const isLimit = usagePercentage >= 100

  return (
    <Card className="bg-white shadow-sm rounded-xl border-0">
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold text-gray-900">今月の利用状況</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {isWarning && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">まもなく上限に達します</AlertDescription>
          </Alert>
        )}
        {isLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>上限に達しました。AI判定が無効化されています。</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2.5">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-gray-900">{currentUsage}</span>
            <span className="text-sm text-gray-500">/ {monthlyLimit}回</span>
          </div>
          <Progress
            value={usagePercentage}
            className={`h-2.5 ${isLimit ? "[&>div]:bg-red-500" : isWarning ? "[&>div]:bg-yellow-500" : "[&>div]:bg-emerald-500"}`}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">利用状況</p>
            <span className="text-xs font-medium text-gray-700">{usagePercentage.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 bg-white border-gray-200 text-gray-700 text-xs h-9"
          >
            <Link href="/pricing">プラン変更</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 bg-white border-gray-200 text-gray-700 text-xs h-9"
          >
            <Link href="/account">請求管理</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { Database } from "@/lib/types/database.types"

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

interface NotificationSettingsProps {
  settings: UserSettings | null
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>通知設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">
                プッシュ通知
              </Label>
              <p className="text-sm text-gray-600">リアルタイムで通知を受け取る</p>
            </div>
            <Switch id="push-notifications" defaultChecked={settings?.notification_push || false} />
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>PWAでプッシュ通知を有効にする方法：</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>ブラウザのメニューから「ホーム画面に追加」を選択</li>
                <li>アプリをホーム画面から起動</li>
                <li>通知の許可を求められたら「許可」を選択</li>
              </ol>
              <p className="mt-2 text-xs text-blue-700">
                ※ iOS Safariでは一部制限があります。Androidでは完全にサポートされています。
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-base">
              メール通知
            </Label>
            <Switch id="email-notifications" defaultChecked={settings?.notification_email || true} />
          </div>

          <div className="ml-6 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="detection-complete" defaultChecked />
              <label htmlFor="detection-complete" className="text-sm">
                判定完了通知
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="limit-reached" defaultChecked />
              <label htmlFor="limit-reached" className="text-sm">
                上限到達通知
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="payment-notifications" defaultChecked />
              <label htmlFor="payment-notifications" className="text-sm">
                決済関連通知
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="news-updates" />
              <label htmlFor="news-updates" className="text-sm">
                お知らせ・新機能
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-0.5">
            <Label htmlFor="team-notifications" className="text-base">
              チーム判定完了通知
            </Label>
            <p className="text-sm text-gray-600">全メンバーの判定完了時に通知</p>
          </div>
          <Switch id="team-notifications" />
        </div>
      </CardContent>
    </Card>
  )
}

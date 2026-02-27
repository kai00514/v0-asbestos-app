import { requireAuth } from "@/lib/api/auth"
import { handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// POST /api/notifications/seed - サンプル通知を作成（開発用）
export async function POST() {
  try {
    const { user } = await requireAuth()
    const supabase = await getSupabaseServerClient()

    const sampleNotifications = [
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "limit_reached" as const,
        title: "判定上限に達しました",
        message: "今月の判定回数が上限の100件に達しました。追加判定を行うにはプランをアップグレードしてください。",
        action_url: "/pricing",
        is_read: false,
        priority: 3,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "limit_warning" as const,
        title: "判定回数が80%に達しました",
        message: "今月の判定回数が80件/100件に達しました。残り20件です。",
        action_url: "/dashboard",
        is_read: false,
        priority: 2,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "detection_completed" as const,
        title: "判定が完了しました",
        message: "「外壁スレート材」の判定が完了しました。結果を確認してください。",
        action_url: "/detections",
        is_read: false,
        priority: 1,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "payment_succeeded" as const,
        title: "お支払いが完了しました",
        message: "プロフェッショナルプラン（¥9,800/月）のお支払いが正常に処理されました。",
        action_url: null,
        is_read: false,
        priority: 1,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "card_expiring" as const,
        title: "カードの有効期限が近づいています",
        message: "登録されているクレジットカード（****1234）の有効期限が来月末です。更新をお願いします。",
        action_url: "/account",
        is_read: false,
        priority: 2,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "member_added" as const,
        title: "新しいメンバーが追加されました",
        message: "田中太郎さんがチームに参加しました。",
        action_url: "/account",
        is_read: true,
        priority: 1,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "article_published" as const,
        title: "新しい記事が公開されました",
        message: "「アスベスト含有建材の見分け方 - 2026年最新版」が公開されました。",
        action_url: null,
        is_read: true,
        priority: 0,
      },
      {
        user_id: user.id,
        company_id: user.company_id,
        type: "system_announcement" as const,
        title: "メンテナンスのお知らせ",
        message: "3月5日 AM2:00〜4:00にシステムメンテナンスを実施します。この間サービスをご利用いただけません。",
        action_url: null,
        is_read: false,
        priority: 2,
      },
    ]

    const { data, error } = await supabase
      .from("notifications")
      .insert(sampleNotifications)
      .select()

    if (error) {
      console.error("Seed notifications error:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return successResponse(data, `${data.length}件のサンプル通知を作成しました`)
  } catch (error) {
    return handleAPIError(error)
  }
}

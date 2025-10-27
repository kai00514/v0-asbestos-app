import { getSupabaseServerClient } from "@/lib/supabase/server"
import { APIError, ErrorCodes } from "./errors"
import type { Database } from "@/lib/types/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

export async function requireAuth() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser()

  if (error || !authUser) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, "認証が必要です")
  }

  // ユーザー情報を取得（会社情報含む）
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*, companies(*)")
    .eq("id", authUser.id)
    .maybeSingle()

  if (userError || !user) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, "ユーザー情報が見つかりません")
  }

  // アクティブステータス確認
  if (!user.is_active) {
    throw new APIError(403, ErrorCodes.FORBIDDEN, "アカウントが無効化されています")
  }

  return { authUser, user: user as User & { companies: any } }
}

export async function requireRole(allowedRoles: ("owner" | "member")[]) {
  const { user } = await requireAuth()

  if (!allowedRoles.includes(user.role as "owner" | "member")) {
    throw new APIError(403, ErrorCodes.FORBIDDEN, "この操作を実行する権限がありません")
  }

  return { user }
}

export async function requireOwner() {
  return requireRole(["owner"])
}

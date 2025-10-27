import { createClient } from "@supabase/supabase-js"
import { APIError, ErrorCodes } from "./errors"
import type { Database } from "@/lib/types/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

export async function requireAuth() {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const {
    data: { user: authUser },
    error,
  } = await supabaseAdmin.auth.getUser()

  if (error || !authUser) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, "認証が必要です")
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("*, companies(*)")
    .eq("id", authUser.id)
    .maybeSingle()

  if (userError || !user) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, "ユーザー情報が見つかりません")
  }

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

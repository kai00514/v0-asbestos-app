import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Company = Database["public"]["Tables"]["companies"]["Row"]
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

export interface AccountData {
  user: User
  company: Company
  subscription: Subscription | null
  settings: UserSettings | null
  teamMembers: User[]
}

export async function getAccountData(userId: string): Promise<AccountData> {
  const supabase = await getSupabaseServerClient()

  // ユーザー情報取得
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

  if (userError || !user) {
    throw new Error("User not found")
  }

  // 会社情報取得
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.company_id)
    .maybeSingle()

  if (companyError || !company) {
    throw new Error("Company not found")
  }

  // サブスクリプション情報取得
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", user.company_id)
    .maybeSingle()

  // ユーザー設定取得
  const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle()

  // チームメンバー取得（オーナーの場合のみ）
  let teamMembers: User[] = []
  if (user.role === "owner") {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("company_id", user.company_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    teamMembers = data || []
  }

  return {
    user,
    company,
    subscription,
    settings,
    teamMembers,
  }
}

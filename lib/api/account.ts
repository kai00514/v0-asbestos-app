import { createClient } from "@supabase/supabase-js"
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
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  console.log("[v0] Fetching account data for user:", userId)

  // ユーザー情報取得
  const { data: user, error: userError } = await supabaseAdmin.from("users").select("*").eq("id", userId).maybeSingle()

  console.log("[v0] User data:", user, "Error:", userError)

  if (userError || !user) {
    throw new Error("User not found")
  }

  // 会社情報取得
  const { data: company, error: companyError } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("id", user.company_id)
    .maybeSingle()

  console.log("[v0] Company data:", company, "Error:", companyError)

  if (companyError || !company) {
    throw new Error("Company not found")
  }

  // サブスクリプション情報取得
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("company_id", user.company_id)
    .maybeSingle()

  // ユーザー設定取得
  const { data: settings } = await supabaseAdmin.from("user_settings").select("*").eq("user_id", userId).maybeSingle()

  // チームメンバー取得（オーナーの場合のみ）
  let teamMembers: User[] = []
  if (user.role === "owner") {
    const { data } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("company_id", user.company_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    teamMembers = data || []
  }

  console.log("[v0] Account data fetched successfully")

  return {
    user,
    company,
    subscription,
    settings,
    teamMembers,
  }
}

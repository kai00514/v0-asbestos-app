"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/types/database.types"

const getAdminClient = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

const getAuthenticatedUser = async () => {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("認証が必要です")
  }

  return { user, supabase }
}

export async function updateAccountInfo(data: {
  userId: string
  companyId: string
  userName: string
  companyName: string
}) {
  const supabaseAdmin = getAdminClient()

  const { error: userError } = await supabaseAdmin.from("users").update({ name: data.userName }).eq("id", data.userId)

  if (userError) throw userError

  const { error: companyError } = await supabaseAdmin
    .from("companies")
    .update({ name: data.companyName })
    .eq("id", data.companyId)

  if (companyError) throw companyError

  revalidatePath("/account")
}

export async function changeEmail(newEmail: string) {
  const { user, supabase } = await getAuthenticatedUser()

  console.log("[v0] Changing email for user:", user.id)

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  )

  if (error) {
    console.log("[v0] Email change error:", error)
    throw error
  }

  console.log("[v0] Confirmation email sent to:", newEmail)
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { user, supabase } = await getAuthenticatedUser()

  console.log("[v0] Changing password for user:", user.id)

  if (currentPassword === newPassword) {
    throw new Error("新しいパスワードは現在のパスワードと異なるものを入力してください")
  }

  if (!user.email) {
    throw new Error("ユーザー情報が見つかりません")
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    console.log("[v0] Re-authentication error:", signInError.message)
    throw new Error("現在のパスワードが正しくありません")
  }

  const supabaseAdmin = getAdminClient()
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (error) {
    console.log("[v0] Password update error:", error.message)
    throw error
  }

  console.log("[v0] Password changed successfully, session invalidated by admin API")

  return { success: true }
}

export async function inviteMember(data: { email: string; name: string; role: "owner" | "member" }) {
  const { user } = await getAuthenticatedUser()
  const supabaseAdmin = getAdminClient()

  console.log("[v0] Adding member, inviter user ID:", user.id)

  const { data: currentUser } = await supabaseAdmin.from("users").select("company_id, role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "owner") {
    throw new Error("メンバーを追加する権限がありません")
  }

  // メール重複チェック
  const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("email", data.email).maybeSingle()
  if (existingUser) {
    throw new Error("このメールアドレスは既に登録されています")
  }

  // Supabase Auth でユーザー作成（メール確認済みとして作成）
  const tempPassword = crypto.randomUUID().slice(0, 12)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: data.name },
  })

  if (authError) {
    console.error("[v0] Auth user creation error:", authError)
    throw new Error("アカウントの作成に失敗しました")
  }

  if (!authData.user) {
    throw new Error("アカウントの作成に失敗しました")
  }

  // usersテーブルに追加
  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    email: data.email,
    name: data.name,
    company_id: currentUser.company_id,
    role: data.role,
    is_active: true,
  })

  if (userError) {
    console.error("[v0] User record creation error:", userError)
    // ロールバック: Auth ユーザーを削除
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error("メンバー情報の保存に失敗しました")
  }

  // user_settings作成
  await supabaseAdmin.from("user_settings").upsert(
    {
      user_id: authData.user.id,
      detection_completed_notifications: true,
      limit_notifications: true,
      payment_notifications: true,
      news_notifications: false,
    },
    { onConflict: "user_id" },
  )

  console.log("[v0] Member added successfully:", data.email)

  revalidatePath("/account")

  return { tempPassword }
}

export async function deleteAccount() {
  const { user } = await getAuthenticatedUser()
  const supabaseAdmin = getAdminClient()

  console.log("[v0] Deleting account for user:", user.id)

  // usersテーブルからユーザー情報を取得
  const { data: userData } = await supabaseAdmin.from("users").select("id, company_id").eq("id", user.id).single()

  if (!userData) {
    throw new Error("ユーザー情報が見つかりません")
  }

  // user_settingsを削除
  await supabaseAdmin.from("user_settings").delete().eq("user_id", user.id)

  // usersテーブルから削除（会社は残す）
  const { error: userDeleteError } = await supabaseAdmin.from("users").delete().eq("id", user.id)

  if (userDeleteError) {
    console.error("[v0] User record delete error:", userDeleteError)
    throw new Error("アカウントの削除に失敗しました")
  }

  // Supabase Authからユーザーを削除
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (authDeleteError) {
    console.error("[v0] Auth user delete error:", authDeleteError)
    throw new Error("認証情報の削除に失敗しました")
  }

  console.log("[v0] Account deleted successfully:", user.id)
}

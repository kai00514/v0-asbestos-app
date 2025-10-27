"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateAccountInfo(data: {
  userId: string
  companyId: string
  userName: string
  companyName: string
}) {
  const supabase = await getSupabaseServerClient()

  // ユーザー名更新
  const { error: userError } = await supabase.from("users").update({ name: data.userName }).eq("id", data.userId)

  if (userError) throw userError

  // 会社名更新
  const { error: companyError } = await supabase
    .from("companies")
    .update({ name: data.companyName })
    .eq("id", data.companyId)

  if (companyError) throw companyError

  revalidatePath("/account")
}

export async function changeEmail(newEmail: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (error) throw error
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await getSupabaseServerClient()

  // 現在のパスワードで再認証
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) throw new Error("User not found")

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) throw new Error("Current password is incorrect")

  // パスワード更新
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

export async function inviteMember(data: { email: string; name: string; role: "owner" | "member" }) {
  const supabase = await getSupabaseServerClient()

  // 現在のユーザーの会社IDを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data: currentUser } = await supabase.from("users").select("company_id, role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "owner") {
    throw new Error("Only owners can invite members")
  }

  // 招待トークン生成
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7日間有効

  const { error } = await supabase.from("invite_tokens").insert({
    company_id: currentUser.company_id,
    email: data.email,
    role: data.role,
    token,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw error

  // TODO: 招待メール送信（後で実装）
  console.log("[v0] Invite email would be sent to:", data.email, "with token:", token)

  revalidatePath("/account")
}

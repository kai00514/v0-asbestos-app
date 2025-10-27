"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const getAdminClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

export async function updateAccountInfo(data: {
  userId: string
  companyId: string
  userName: string
  companyName: string
}) {
  const supabaseAdmin = getAdminClient()

  // ユーザー名更新
  const { error: userError } = await supabaseAdmin.from("users").update({ name: data.userName }).eq("id", data.userId)

  if (userError) throw userError

  // 会社名更新
  const { error: companyError } = await supabaseAdmin
    .from("companies")
    .update({ name: data.companyName })
    .eq("id", data.companyId)

  if (companyError) throw companyError

  revalidatePath("/account")
}

export async function changeEmail(newEmail: string) {
  const supabaseAdmin = getAdminClient()

  const {
    data: { user },
  } = await supabaseAdmin.auth.admin.getUserById((await supabaseAdmin.auth.getUser()).data.user?.id || "")

  if (!user) throw new Error("User not found")

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email: newEmail,
  })

  if (error) throw error
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabaseAdmin = getAdminClient()

  if (currentPassword === newPassword) {
    throw new Error("新しいパスワードは現在のパスワードと異なるものを入力してください")
  }

  // 現在のパスワードで再認証
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser()

  if (!user?.email) throw new Error("User not found")

  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) throw new Error("現在のパスワードが正しくありません")

  // パスワード更新
  const { error } = await supabaseAdmin.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    if (error.message.includes("same_password")) {
      throw new Error("新しいパスワードは現在のパスワードと異なるものを入力してください")
    }
    throw error
  }
}

export async function inviteMember(data: { email: string; name: string; role: "owner" | "member" }) {
  const supabaseAdmin = getAdminClient()

  // 現在のユーザーの会社IDを取得
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data: currentUser } = await supabaseAdmin.from("users").select("company_id, role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "owner") {
    throw new Error("Only owners can invite members")
  }

  // 招待トークン生成
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7日間有効

  const { error } = await supabaseAdmin.from("invite_tokens").insert({
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

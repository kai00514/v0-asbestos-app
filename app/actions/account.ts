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

  console.log("[v0] Inviting member, inviter user ID:", user.id)

  const { data: currentUser } = await supabaseAdmin.from("users").select("company_id, role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "owner") {
    throw new Error("Only owners can invite members")
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { error } = await supabaseAdmin.from("invite_tokens").insert({
    company_id: currentUser.company_id,
    email: data.email,
    role: data.role,
    token,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw error

  console.log("[v0] Invite email would be sent to:", data.email, "with token:", token)

  revalidatePath("/account")
}

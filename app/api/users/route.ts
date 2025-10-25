import type { NextRequest } from "next/server"
import { requireAuth, requireRole } from "@/lib/api/auth"
import { inviteUserSchema } from "@/lib/validations/users"
import { APIError, ErrorCodes, handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

// GET /api/users - ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await getSupabaseServerClient()

    // 同じ会社のユーザー一覧取得
    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        *,
        user_site_tags(
          site_tags(*)
        )
      `,
      )
      .eq("company_id", user.company_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Users fetch error:", error)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "ユーザー一覧の取得に失敗しました")
    }

    return successResponse(users)
  } catch (error) {
    return handleAPIError(error)
  }
}

// POST /api/users - ユーザー招待
export async function POST(request: NextRequest) {
  try {
    // Owner権限が必要（memberは招待不可）
    const { user } = await requireRole(["owner"])
    const body = await request.json()

    // バリデーション
    const validatedData = inviteUserSchema.parse(body)

    const supabase = await getSupabaseServerClient()

    // メール重複チェック
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", validatedData.email).single()

    if (existingUser) {
      throw new APIError(409, ErrorCodes.EMAIL_ALREADY_EXISTS, "このメールアドレスは既に登録されています")
    }

    // 招待トークン生成（7日間有効）
    const inviteToken = randomBytes(32).toString("base64url")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後

    // invite_tokensテーブルに保存
    const { error: tokenError } = await supabase.from("invite_tokens").insert({
      token: inviteToken,
      email: validatedData.email,
      company_id: user.company_id,
      role: validatedData.role,
      department: validatedData.department,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })

    if (tokenError) {
      console.error("[v0] Invite token creation error:", tokenError)
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, "招待トークンの作成に失敗しました")
    }

    // TODO: SendGrid経由で招待メール送信
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?token=${inviteToken}`
    console.log("[v0] Invite URL:", inviteUrl)

    return successResponse(
      {
        inviteToken,
        inviteUrl,
        expiresAt,
      },
      "招待メールを送信しました",
    )
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return handleAPIError(new APIError(400, ErrorCodes.VALIDATION_ERROR, "入力値が不正です", (error as any).errors))
    }
    return handleAPIError(error)
  }
}

import type { NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    await supabase.auth.signOut()

    return successResponse({}, "ログアウトしました")
  } catch (error) {
    return handleAPIError(error)
  }
}

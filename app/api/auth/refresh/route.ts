import type { NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { handleAPIError } from "@/lib/api/errors"
import { successResponse } from "@/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession()

    if (error) {
      throw error
    }

    return successResponse({ session }, "トークンを更新しました")
  } catch (error) {
    return handleAPIError(error)
  }
}

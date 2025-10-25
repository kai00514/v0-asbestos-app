export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  LIMIT_REACHED: "LIMIT_REACHED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

export function handleAPIError(error: unknown) {
  console.error("[v0] API Error:", error)

  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode },
    )
  }

  // 予期しないエラー
  return Response.json(
    {
      error: "サーバーエラーが発生しました",
      code: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    },
    { status: 500 },
  )
}

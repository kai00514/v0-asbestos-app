export function successResponse<T>(data: T, message?: string) {
  return Response.json({
    data,
    message: message || "操作が成功しました",
  })
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
) {
  return Response.json({
    data,
    pagination: {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  })
}

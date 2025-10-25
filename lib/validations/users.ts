import { z } from "zod"

export const inviteUserSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.enum(["owner", "member"], {
    errorMap: () => ({ message: "ロールはownerまたはmemberである必要があります" }),
  }),
  department: z.string().optional(),
  siteTagIds: z.array(z.string().uuid()).optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, "名前を入力してください").optional(),
  role: z.enum(["owner", "member"]).optional(),
  department: z.string().optional(),
  is_active: z.boolean().optional(),
  siteTagIds: z.array(z.string().uuid()).optional(),
})

export const updateMeSchema = z.object({
  name: z.string().min(1, "名前を入力してください").optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateMeInput = z.infer<typeof updateMeSchema>

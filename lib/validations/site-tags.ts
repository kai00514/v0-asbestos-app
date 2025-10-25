import { z } from "zod"

export const createSiteTagSchema = z.object({
  name: z.string().min(1, "タグ名を入力してください"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "有効な色コード（#RRGGBB）を入力してください"),
  description: z.string().optional(),
})

export const updateSiteTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  description: z.string().optional(),
})

export type CreateSiteTagInput = z.infer<typeof createSiteTagSchema>
export type UpdateSiteTagInput = z.infer<typeof updateSiteTagSchema>

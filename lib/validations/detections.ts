import { z } from "zod"

export const createDetectionSchema = z.object({
  sample_name: z.string().min(1, "サンプル名を入力してください"),
  site_name: z.string().min(1, "現場名を入力してください"),
  site_tag_id: z.string().uuid().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  address: z.string().optional(),
  images: z
    .array(
      z.object({
        data: z.string(), // base64
        filename: z.string(),
      }),
    )
    .min(1, "少なくとも1枚の画像が必要です")
    .max(6, "画像は最大6枚までです"),
})

export const updateDetectionSchema = z.object({
  sample_name: z.string().min(1).optional(),
  site_name: z.string().min(1).optional(),
  site_tag_id: z.string().uuid().nullable().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .nullable()
    .optional(),
  address: z.string().nullable().optional(),
  notes: z.string().optional(),
})

export type CreateDetectionInput = z.infer<typeof createDetectionSchema>
export type UpdateDetectionInput = z.infer<typeof updateDetectionSchema>
